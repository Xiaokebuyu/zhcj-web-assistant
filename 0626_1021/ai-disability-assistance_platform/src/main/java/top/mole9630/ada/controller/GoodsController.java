package top.mole9630.ada.controller;

import cn.dev33.satoken.exception.NotLoginException;
import cn.dev33.satoken.stp.StpUtil;
import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import io.swagger.annotations.Api;
import io.swagger.annotations.ApiOperation;
import io.swagger.annotations.ApiImplicitParam;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import top.mole9630.ada.common.Result;
import top.mole9630.ada.entity.Exchange;
import top.mole9630.ada.entity.ScoreStore;
import top.mole9630.ada.entity.User;
import top.mole9630.ada.service.ExchangeService;
import top.mole9630.ada.service.ScoreStoreService;
import top.mole9630.ada.service.UserService;

import java.util.Date;
import java.util.List;

@RestController
@RequestMapping("/goods")
@Api(tags = "积分商品相关接口")
@Slf4j
public class GoodsController {
    @Autowired
    private ScoreStoreService scoreStoreService;
    
    @Autowired
    private ExchangeService exchangeService;
    
    @Autowired
    private UserService userService;
    
    /**
     * 获取当前用户ID
     * @return 当前用户ID
     * @throws NotLoginException 用户未登录
     */
    private Integer getCurrentUserId() throws NotLoginException {
        return StpUtil.getLoginIdAsInt();
    }
    
    /**
     * 获取积分商品列表（仅志愿者可用）
     * @return 积分商品列表
     */
    @GetMapping("/list")
    @ApiOperation(value = "获取积分商品列表", notes = "获取所有可兑换的积分商品，仅志愿者可用")
    public Result<List<ScoreStore>> getGoodsList() {
        try {
            Integer userId = getCurrentUserId();
            User user = userService.getById(userId);
            
            // 检查用户类型是否为志愿者
            if (user == null || user.getUType() != 1) {
                return Result.error(0, "仅志愿者可查看积分商品");
            }
            
            List<ScoreStore> goodsList = scoreStoreService.list();
            return Result.success(goodsList, "查询成功");
        } catch (NotLoginException e) {
            return Result.error(0, "用户登录态失效, 请重新登录");
        }
    }
    
    /**
     * 兑换商品（仅志愿者可用）
     * @param goodId 商品ID
     * @return 兑换结果
     */
    @PostMapping("/exchange/{goodId}")
    @ApiOperation(value = "兑换商品", notes = "兑换指定商品，仅志愿者可用")
    @ApiImplicitParam(name = "goodId", value = "商品ID", required = true, dataType = "int", paramType = "path")
    public Result<String> exchangeGood(@PathVariable Integer goodId) {
        try {
            Integer userId = getCurrentUserId();
            User user = userService.getById(userId);
            
            // 检查用户类型是否为志愿者
            if (user == null || user.getUType() != 1) {
                return Result.error(0, "仅志愿者可兑换商品");
            }
            
            ScoreStore good = scoreStoreService.getById(goodId);
            if (good == null) {
                return Result.error(0, "商品不存在");
            }
            
            // 检查用户积分是否足够
            if (user.getUScore() < good.getSGoodScore()) {
                return Result.error(0, "积分不足");
            }
            
            // 扣除用户积分
            user.setUScore(user.getUScore() - good.getSGoodScore());
            userService.updateById(user);
            
            // 创建兑换记录
            Exchange exchange = new Exchange();
            exchange.setExUid(userId);
            exchange.setExGoodName(good.getSGoodName());
            exchange.setExScore(String.valueOf(good.getSGoodScore()));
            exchange.setExTime(new Date());
            exchangeService.save(exchange);
            
            return Result.success("兑换成功");
        } catch (NotLoginException e) {
            return Result.error(0, "用户登录态失效, 请重新登录");
        }
    }
}