package top.mole9630.ada.controller;

import cn.dev33.satoken.exception.NotLoginException;
import cn.dev33.satoken.stp.StpUtil;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import io.swagger.annotations.Api;
import io.swagger.annotations.ApiOperation;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import top.mole9630.ada.common.Result;
import top.mole9630.ada.dto.FeedbackSubmitDto;
import top.mole9630.ada.entity.Feedback;
import top.mole9630.ada.service.FeedbackService;

import javax.validation.Valid;
import java.util.Date;
import java.util.List;

@RestController
@RequestMapping("/Feedback")
@CrossOrigin(origins = "http://localhost:8080", allowCredentials = "true")
@Api(tags = "反馈相关接口")
@Slf4j
public class FeedbackController {
    @Autowired
    private FeedbackService feedbackService;

//    ①前端—向后端传输新的数据
    @PostMapping("/submit")
    @ApiOperation(value = "提交反馈")
    public Result<Feedback> submitFeedback(@Valid @RequestBody FeedbackSubmitDto feedbackSubmitDto) {
        int userId;
        try{
            userId = StpUtil.getLoginIdAsInt();
            log.info("当前userId: {}", userId);
        }catch (NotLoginException e){
            return Result.error(0,"用户未登录，请先登录");
        }

        if (feedbackSubmitDto.getContent() == null || feedbackSubmitDto.getContent().trim().isEmpty()) {
            return Result.error(0,"反馈内容不能为空");
        }
                // 验证内容长度（与注解保持一致）
        if (feedbackSubmitDto.getContent().length() > 200) {
            return Result.error(0,"反馈内容不能超过200字");
        }
                // 判断手机号是否合规
        if (feedbackSubmitDto.getPhone() == null || !feedbackSubmitDto.getPhone().matches("^1[3-9]\\d{9}$")) {
            return Result.error(0,"手机号必须是11位有效数字");
        }
                // 验证反馈类型范围
        if (feedbackSubmitDto.getType() == null || feedbackSubmitDto.getType() < 0 || feedbackSubmitDto.getType() > 3) {
            return Result.error(0,"反馈类型必须在0-3之间");
        }

        Feedback feedback = new Feedback();
        feedback.setFbUId(userId);
        feedback.setFbContent(feedbackSubmitDto.getContent());
        feedback.setFbPhone(feedbackSubmitDto.getPhone());
        feedback.setFbType(feedbackSubmitDto.getType());
        feedback.setFbName(feedbackSubmitDto.getName());
        feedbackService.save(feedback);
        return Result.success(feedback,"反馈成功！");
    }

    @GetMapping("/user/{userId}")
    @ApiOperation(value = "获取指定用户的反馈信息", notes = "根据用户ID获取该用户的所有反馈记录")
    public Result<List<Feedback>> getFeedbackByUserId(
            @PathVariable Integer userId,
            @RequestParam(required = false) Integer type,
            @RequestParam(required = false) @DateTimeFormat(pattern = "yyyy-MM-dd") Date startDate,
            @RequestParam(required = false) @DateTimeFormat(pattern = "yyyy-MM-dd") Date endDate) {

        try {
            // 验证当前用户权限（可选）
            StpUtil.checkLogin();

            // 构建查询条件
            LambdaQueryWrapper<Feedback> queryWrapper = new LambdaQueryWrapper<>();
            queryWrapper.eq(Feedback::getFbUId, userId);

            // 可选筛选条件
            if (type != null) {
                queryWrapper.eq(Feedback::getFbType, type);
            }
            if (startDate != null && endDate != null) {
                queryWrapper.between(Feedback::getCreateTime, startDate, endDate);
            }

            // 排序
            queryWrapper.orderByDesc(Feedback::getCreateTime);

            List<Feedback> feedbackList = feedbackService.list(queryWrapper);

            return Result.success(feedbackList);
        } catch (NotLoginException e) {
            return Result.error(0, "用户未登录，请先登录");
        } catch (Exception e) {
            log.error("获取用户[{}]反馈信息异常", userId, e);
            return Result.error(0, "获取反馈信息失败");
        }
    }


////    ②后端-向前端返回数据
//    @GetMapping("/list")
//    @ApiOperation(value = "获取用户反馈历史")
//    public Result<List<Feedback>> getFeedbackHistory() {
//        try {
//            int userId = StpUtil.getLoginIdAsInt();
//            List<Feedback> feedbackList = feedbackService.lambdaQuery()
//                    .eq(Feedback::getFbUId, userId)
////                    .orderByDesc(Feedback::getCreateTime)
//                    .list();
//            return Result.success(feedbackList);
//        } catch (NotLoginException e) {
//            return Result.error(0, "用户未登录，请先登录");
//        } catch (Exception e) {
//            log.error("获取反馈历史异常", e);
//            return Result.error(0, "获取反馈历史失败");
//        }
//    }
}