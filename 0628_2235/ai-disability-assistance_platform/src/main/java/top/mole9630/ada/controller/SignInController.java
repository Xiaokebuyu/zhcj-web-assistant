package top.mole9630.ada.controller;

import cn.dev33.satoken.stp.StpUtil;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import io.swagger.annotations.Api;
import io.swagger.annotations.ApiOperation;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import top.mole9630.ada.common.Result;
import top.mole9630.ada.entity.SignIn;
import top.mole9630.ada.entity.User;
import top.mole9630.ada.service.SignInService;
import top.mole9630.ada.service.UserService;

import java.util.Calendar;
import java.util.Date;
import java.util.Random;

@RestController
@RequestMapping("/signin")
@Api(tags = "签到管理")
@CrossOrigin(origins = "http://localhost:8080",allowCredentials = "true")
public class SignInController {
    
    @GetMapping("/records")
    @ApiOperation(value = "获取用户签到记录", notes = "分页查询当前用户的签到记录")
    public Result<Page<SignIn>> getSignInRecords(
            @RequestParam(defaultValue = "1") Integer pageNum,
            @RequestParam(defaultValue = "10") Integer pageSize) {
        Integer userId = StpUtil.getLoginIdAsInt();
        Page<SignIn> page = new Page<>(pageNum, pageSize);
        
        return Result.success(signInService.lambdaQuery()
                .eq(SignIn::getSUid, userId)
                .orderByDesc(SignIn::getSTime)
                .page(page));
    }
    @Autowired
    private SignInService signInService;
    @Autowired
    private UserService userService;

    @PostMapping
    @ApiOperation(value = "用户签到", notes = "每日限签一次，固定获得1积分")
    @Transactional
    public Result<Integer> signIn() {
        Integer userId = StpUtil.getLoginIdAsInt();

        // 检查今日是否已签到
        if (hasSignedToday(userId)) {
            return Result.error(0, "今日已签到，请明天再来");
        }

        // 生成随机积分
        int points = 1;

        // 更新用户积分
        User user = userService.getById(userId);
        user.setUScore(user.getUScore() + points);
        userService.updateById(user);

        // 记录签到
        SignIn signIn = new SignIn();
        signIn.setSUid(userId);
        signIn.setSTime(new Date());
        signIn.setSScore(points);
        signInService.save(signIn);

        return Result.success(points, "签到成功，获得" + points + "积分");
    }

    private boolean hasSignedToday(Integer userId) {
        Calendar today = Calendar.getInstance();
        today.set(Calendar.HOUR_OF_DAY, 0);
        today.set(Calendar.MINUTE, 0);
        today.set(Calendar.SECOND, 0);
        today.set(Calendar.MILLISECOND, 0);

        return signInService.lambdaQuery()
                .eq(SignIn::getSUid, userId)
                .ge(SignIn::getSTime, today.getTime())
                .last("LIMIT 1")
                .one() != null;
    }
}