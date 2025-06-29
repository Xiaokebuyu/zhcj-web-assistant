package top.mole9630.ada.controller;

import cn.dev33.satoken.stp.StpUtil;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import io.swagger.annotations.Api;
import io.swagger.annotations.ApiOperation;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import top.mole9630.ada.common.Result;
import top.mole9630.ada.dto.GetRequestDto;
import top.mole9630.ada.entity.Request;
import top.mole9630.ada.entity.User;
import top.mole9630.ada.service.RequestService;
import top.mole9630.ada.service.UserService;

import java.util.Arrays;
import java.util.Date;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/request")
@CrossOrigin(origins = "http://localhost:8080",allowCredentials = "true")
@Api(tags = "求助相关接口")
public class RequestController {
    @Autowired
    private RequestService requestService;
    
    @Autowired
    private UserService userService;

    /**
     * 发布求助信息
     * @param request 求助信息对象
     * @return 发布结果
     */
    @PostMapping("/publish")
    @ResponseBody
    @ApiOperation(value = "发布求助信息")
    public Result<String> publishRequest(@RequestBody Request request) {
        // 打印前端传入的数据
        System.out.println("前端数据: " + request);
        // 打印接收到的数据，检查是否解析正确
        System.out.println("这是rType: " + request.getRType());
        System.out.println("这是rUrgent: " + request.getRUrgent());
        System.out.println("这是rAddress: " + request.getRAddress());
        System.out.println("这是rIsOnline: " + request.getRIsOnline());

        // 验证线上/线下字段
        if (request.getRIsOnline() == null || (request.getRIsOnline() != 0 && request.getRIsOnline() != 1)) {
            return Result.error(0, "请指定正确的求助方式(0-线下,1-线上)");
        }

        // 如果是线下求助，必须要有地址
        if (request.getRIsOnline() == 0 && (request.getRAddress() == null || request.getRAddress().isEmpty())) {
            return Result.error(0, "线下求助必须填写地址");
        }

        // 设置当前用户ID
        request.setRHid(StpUtil.getLoginIdAsInt());
        // 设置发布时间为当前时间
        request.setRSendTime(new Date());
        // 设置固定积分为5
        request.setRScore(5);
        // 设置解决状态为待认领
        request.setRIsSolve(0);

        // 保存到数据库
        boolean saved = requestService.save(request);
        return saved ? Result.success(null,"发布成功") : Result.error(0,"发布失败");

        // 保存求助信息
//        boolean flag = requestService.save(request);
//        if (!flag) {
//            return Result.error(0, "发布求助信息失败");
//        }
//        return Result.success(null, "发布求助信息成功");
    }


    /**
     * 求助者确认需求完成
     * @param rid 需求ID
     * @param rRate 评分
     * @return 结果
     */
    @PutMapping("/complete/{rid}/{rRate}")
    @ApiOperation(value = "求助者最终确认需求完成")
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
        request.setRIsSolve(3); // 求助者确认最终完成
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
     * @return 认领结果
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
    public Result<List<GetRequestDto>> getRequestList(
            @RequestParam(required = false) Integer uid,
            @RequestParam(required = false, defaultValue = "3") Integer queryType,
            @RequestParam(required = false) Integer isOnline) {
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

        // 添加线上/线下查询条件
        if (isOnline != null && (isOnline == 0 || isOnline == 1)) {
            queryWrapper.eq(Request::getRIsOnline, isOnline);
        }

        List<Request> requests = requestService.list(queryWrapper);
        
        List<GetRequestDto> dtoList = requests.stream().map(request -> {
            GetRequestDto dto = new GetRequestDto(request);
            // 查询求助者姓名
            User helper = userService.getById(request.getRHid());
            dto.setHName(helper != null ? helper.getUName() : "未知用户");
            
            // 查询志愿者姓名（如果有）
            if (request.getRVid() != null) {
                User volunteer = userService.getById(request.getRVid());
                dto.setVName(volunteer != null ? volunteer.getUName() : "未知志愿者");
            }
            return dto;
        }).collect(Collectors.toList());
        
        return Result.success(dtoList, "查询成功");
    }

    /**
     * 获取志愿者已接取但未完成的任务
     * @return 任务列表
     */
    @GetMapping("/volunteer/accepted")
    @ApiOperation(value = "获取志愿者已接取但未完成的任务")
    public Result<List<GetRequestDto>> getVolunteerAcceptedTasks() {
        // 验证志愿者身份
        Integer vid = StpUtil.getLoginIdAsInt();
        User volunteer = userService.getById(vid);

        if (volunteer == null || volunteer.getUType() != 1) {
            return Result.error(0, "非志愿者用户无法查看已接取任务");
        }

        LambdaQueryWrapper<Request> queryWrapper = new LambdaQueryWrapper<>();
        queryWrapper.eq(Request::getRVid, vid)  // 当前志愿者接取的任务
                .in(Request::getRIsSolve, Arrays.asList(1, 2)); // 状态为已接取但未完成(1)或已提交待确认(2)

        List<Request> requests = requestService.list(queryWrapper);

        List<GetRequestDto> dtoList = requests.stream().map(request -> {
            GetRequestDto dto = new GetRequestDto(request);
            // 查询求助者姓名
            User helper = userService.getById(request.getRHid());
            dto.setHName(helper != null ? helper.getUName() : "未知用户");

            // 设置志愿者姓名（当前用户自己）
            dto.setVName(volunteer.getUName());

            return dto;
        }).collect(Collectors.toList());

        return Result.success(dtoList, "查询成功");
    }

    /**
     * 志愿者标记任务为已完成
     * @param rid 需求ID
     * @return 操作结果
     */
    @PutMapping("/complete/{rid}")
    @ApiOperation(value = "志愿者申请确认任务已完成")
    @CrossOrigin(origins = "http://localhost:8080",allowCredentials = "true")
    public Result<String> volunteerCompleteRequest(
            @PathVariable("rid") Integer rid) {
        // 验证志愿者身份
        Integer vid = StpUtil.getLoginIdAsInt();
        User volunteer = userService.getById(vid);
        if (volunteer == null || volunteer.getUType() != 1) {
            return Result.error(0, "非志愿者用户无法完成此操作");
        }

        // 获取并更新需求记录
        Request request = requestService.getById(rid);
        if (request == null) {
            return Result.error(0, "需求不合法");
        }

        // 验证是否是当前志愿者接取的任务
        if (!vid.equals(request.getRVid())) {
            return Result.error(0, "只能完成自己接取的任务");
        }

        // 更新解决状态和时间
        request.setRIsSolve(2); // 2表示志愿者申请确认
        request.setRSolveTime(new Date());

        boolean updated = requestService.updateById(request);

        if(updated){
            // 给志愿者增加积分
            volunteer.setUScore(volunteer.getUScore() + request.getRScore());
            userService.updateById(volunteer);
        }

        return updated ?
                Result.success(null, "任务已完成") :
                Result.error(0, "任务完成操作失败");
    }

    /**
     * 志愿者取消已接取的任务
     * @param rid 需求ID
     * @return 操作结果
     */
    @PutMapping("/cancel/{rid}")
    @ApiOperation(value = "志愿者取消已接取的任务")
    public Result<String> cancelRequest(
            @PathVariable("rid") Integer rid) {
        // 验证志愿者身份
        Integer vid = StpUtil.getLoginIdAsInt();
        User volunteer = userService.getById(vid);
        if (volunteer == null || volunteer.getUType() != 1) {
            return Result.error(0, "非志愿者用户无法取消任务");
        }

        // 获取并更新需求记录
        Request request = requestService.getById(rid);
        if (request == null) {
            return Result.error(0, "需求不合法");
        }

        // 验证是否是当前志愿者接取的任务
        if (!vid.equals(request.getRVid())) {
            return Result.error(0, "只能取消自己接取的任务");
        }

        // 验证任务状态是否为已接取但未完成
        if (request.getRIsSolve() != 1) {
            return Result.error(0, "只能取消进行中的任务");
        }

        // 重置任务状态为待认领
        request.setRVid(null);
        request.setRIsSolve(0);
        request.setRSolveTime(null);

        boolean updated = requestService.updateById(request);

        return updated ?
                Result.success(null, "任务已取消") :
                Result.error(0, "任务取消失败");
    }

}