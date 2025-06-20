package top.mole9630.ada.controller;

import cn.dev33.satoken.stp.StpUtil;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import io.swagger.annotations.Api;
import io.swagger.annotations.ApiOperation;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import top.mole9630.ada.common.Result;
import top.mole9630.ada.entity.Request;
import top.mole9630.ada.entity.User;
import top.mole9630.ada.service.RequestService;
import top.mole9630.ada.service.UserService;

import java.util.Date;
import java.util.List;

@RestController
@RequestMapping("/request")
@CrossOrigin(origins = "*")
@Api(tags = "求助相关接口")
public class RequestController {
    @Autowired
    private RequestService requestService;
    
    @Autowired
    private UserService userService;

    /**
     * 确认需求完成
     * @param rid 需求ID
     * @param rRate 评分
     * @return
     */
    @PutMapping("/complete/{rid}/{rRate}")
    @ApiOperation(value = "确认需求完成")
    public Result<String> completeRequest(
            @PathVariable("rid") Integer rid,
            @PathVariable("rRate") Integer rRate) {
        // 获取当前用户
        Integer currentUserId = StpUtil.getLoginIdAsInt();
        User currentUser = userService.getById(currentUserId);

        // 验证用户类型
        if (currentUser == null || currentUser.getUType() != 0) {
            return Result.error(0, "非求助者用户无法确认完成");
        }

        // 获取并更新需求记录
        Request request = requestService.getById(rid);
        if (request == null) {
            return Result.error(0, "需求不合法");
        }

        // 更新解决状态和时间
        request.setRIsSolve(2);
        request.setRSolveTime(new Date());
        request.setRRate(rRate);
        
        boolean updated = requestService.updateById(request);
        
        if(updated && request.getRVid() != null){
            // 给对应志愿者增加积分
            User volunteer = userService.getById(request.getRVid());
            if(volunteer != null){
                volunteer.setUScore(volunteer.getUScore() + request.getRScore());
                userService.updateById(volunteer);
            }
        }
        
        return updated ? 
            Result.success(null, "需求已完成确认") : 
            Result.error(0, "需求确认失败");
    }

    /**
     * 志愿者认领求助
     * @param rid 需求ID
     * @return
     */
    @PutMapping("/accept/{rid}")
    @ApiOperation(value = "志愿者认领求助")
    public Result<String> acceptRequest(
            @PathVariable("rid") Integer rid) {
        // 验证志愿者身份
        Integer vid = StpUtil.getLoginIdAsInt();
        User volunteer = userService.getById(vid);
        if (volunteer == null || volunteer.getUType() != 1) {
            return Result.error(0, "非志愿者用户无法接受求助");
        }

        // 获取并更新需求记录
        Request request = requestService.getById(rid);
        if (request == null) {
            return Result.error(0, "需求不合法");
        }
        
        request.setRVid(vid);
        request.setRIsSolve(1);
        boolean updated = requestService.updateById(request);
        
        return updated ? 
            Result.success(null, "接受求助成功") : 
            Result.error(0, "接受求助失败");
    }

    /**
     * 查询求助信息
     * @return 求助信息列表
     */
    @GetMapping("/volunteer/records")
    @ApiOperation(value = "获取志愿者帮扶记录")
    public Result<?> getVolunteerRecords() {
        // 验证志愿者身份
        Integer vid = StpUtil.getLoginIdAsInt();
        User volunteer = userService.getById(vid);
        
        if (volunteer == null || volunteer.getUType() != 1) {
            return Result.error(0, "非志愿者用户无法查看帮扶记录");
        }

        LambdaQueryWrapper<Request> queryWrapper = new LambdaQueryWrapper<>();
        queryWrapper.eq(Request::getRVid, vid);
        
        return Result.success(requestService.list(queryWrapper), "查询成功");
    }

    @GetMapping("/list")
    @ApiOperation(value = "获取求助信息(多功能)")
    public Result<List<Request>> getRequestList(
            @RequestParam(required = false) Integer uid,
            @RequestParam(required = false, defaultValue = "3") Integer queryType) {
        LambdaQueryWrapper<Request> queryWrapper = new LambdaQueryWrapper<>();

        // 添加用户ID关联查询条件
        if (uid != null) {
            queryWrapper.and(qw -> qw
                .eq(Request::getRHid, uid)
                .or()
                .eq(Request::getRVid, uid)
            );
        }

        // 保留原有解决状态查询条件
        if (queryType != null && queryType < 3) {
            queryWrapper.eq(Request::getRIsSolve, queryType);
        }

        List<Request> list = requestService.list(queryWrapper);
        return Result.success(list, "查询成功");
    }

    /**
     * 发布求助信息
     * @param request 求助信息对象
     * @return 发布结果
     */
    @PostMapping("/publish")
    @ApiOperation(value = "发布求助信息")
    public Result<String> publishRequest(@RequestBody Request request) {
        // 设置当前用户ID
        request.setRHid(StpUtil.getLoginIdAsInt());
        // 设置发布时间为当前时间
        request.setRSendTime(new Date());
        // 设置固定积分为5
        request.setRScore(5);
        // 设置解决状态为待认领
        request.setRIsSolve(0);
        
        // 保存求助信息
        boolean flag = requestService.save(request);
        if (!flag) {
            return Result.error(0, "发布求助信息失败");
        }
        return Result.success(null, "发布求助信息成功");
    }
}