package top.mole9630.ada.controller;

import cn.dev33.satoken.exception.NotLoginException;
import cn.dev33.satoken.stp.StpUtil;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import io.swagger.annotations.Api;
import io.swagger.annotations.ApiImplicitParam;
import io.swagger.annotations.ApiImplicitParams;
import io.swagger.annotations.ApiOperation;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import top.mole9630.ada.common.Result;
import top.mole9630.ada.dto.GetPostDto;
import top.mole9630.ada.dto.GetReplyDto;
import top.mole9630.ada.entity.Post;
import top.mole9630.ada.entity.Reply;
import top.mole9630.ada.service.PostService;
import top.mole9630.ada.service.ReplyService;
import top.mole9630.ada.service.UserService;

import java.util.Date;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/forum")
@CrossOrigin(origins = "http://localhost:8080", allowCredentials = "true")
@Api(tags = "论坛相关接口")
@Slf4j
public class ForumController {
    @Autowired
    private PostService postService;

    @Autowired
    private ReplyService replyService;

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
     * 发布帖子
     * @param post 帖子信息
     * @return 帖子信息
     */
    @PostMapping("/publish")
    @ApiOperation(value = "发布帖子", notes = "用户发布新帖子")
    public Result<Post> publishPost(@RequestBody Post post) {
        Integer userId = getCurrentUserId();
        
        post.setFUid(userId);
        post.setFTime(new Date());
        post.setFLike(0);
        postService.save(post);

        return Result.success(post, "发帖成功");
    }

    /**
     * 回复帖子
     * @param reply 回复信息
     * @return 回复信息
     */
    @PostMapping("/reply")
    @ApiOperation(value = "回复帖子", notes = "用户回复指定帖子")
    public Result<Reply> addReply(@RequestBody Reply reply) {
        Integer userId = getCurrentUserId();
        
        if (postService.getById(reply.getRpFid()) == null) {
            return Result.error(0, "帖子不存在");
        }

        reply.setRpUid(userId);
        reply.setRpTime(new Date());
        reply.setRpLike(0);
        replyService.save(reply);

        return Result.success(reply, "回复成功");
    }

    /**
     * 获取帖子列表（分页）
     * @param type 帖子类型
     * @param page 页码
     * @param pageSize 每页数量
     * @return 分页帖子列表
     */
    @GetMapping("/list")
    @ApiOperation(value = "获取帖子列表", notes = "分页获取帖子列表，可按类型筛选，包含回复数量")
    @ApiImplicitParams({
            @ApiImplicitParam(name = "type", value = "帖子类型", dataType = "int", paramType = "query"),
            @ApiImplicitParam(name = "page", value = "页码", defaultValue = "1", dataType = "int", paramType = "query"),
            @ApiImplicitParam(name = "pageSize", value = "每页数量", defaultValue = "10", dataType = "int", paramType = "query")
    })
    public Result<Page<GetPostDto>> getPostList(
            @RequestParam(required = false) Integer type,
            @RequestParam(defaultValue = "1") Integer page,
            @RequestParam(defaultValue = "10") Integer pageSize) {
        LambdaQueryWrapper<Post> queryWrapper = new LambdaQueryWrapper<>();
        if (type != null) {
            queryWrapper.eq(Post::getFType, type);
        }
        queryWrapper.orderByDesc(Post::getFTime);
        Page<Post> postPage = postService.page(new Page<>(page, pageSize), queryWrapper);
        
        List<GetPostDto> dtoList = postPage.getRecords().stream().map(post -> {
            LambdaQueryWrapper<Reply> replyQueryWrapper = new LambdaQueryWrapper<>();
            replyQueryWrapper.eq(Reply::getRpFid, post.getFId());
            int replyCount = replyService.count(replyQueryWrapper);
            GetPostDto dto = GetPostDto.from(
                post,
                replyCount,
                userService.getById(post.getFUid()).getUName()
            );
            return dto;
        }).collect(Collectors.toList());
        
        Page<GetPostDto> resultPage = new Page<>(postPage.getCurrent(), postPage.getSize(), postPage.getTotal());
        resultPage.setRecords(dtoList);
        return Result.success(resultPage, "查询成功");
    }

    /**
     * 获取帖子回复（分页）
     * @param postId 帖子ID
     * @param page 页码
     * @param pageSize 每页数量
     * @return 分页帖子回复列表
     */
    @GetMapping("/replies/{postId}")
    @ApiOperation(value = "获取帖子回复", notes = "分页获取指定帖子的回复列表")
    @ApiImplicitParams({
            @ApiImplicitParam(name = "postId", value = "帖子ID", required = true, dataType = "int", paramType = "path"),
            @ApiImplicitParam(name = "page", value = "页码", defaultValue = "1", dataType = "int", paramType = "query"),
            @ApiImplicitParam(name = "pageSize", value = "每页数量", defaultValue = "10", dataType = "int", paramType = "query")
    })
    public Result<Page<GetReplyDto>> getReplies(
            @PathVariable Integer postId,
            @RequestParam(defaultValue = "1") Integer page,
            @RequestParam(defaultValue = "10") Integer pageSize) {
        if (postService.getById(postId) == null) {
            return Result.error(0, "帖子不存在");
        }
        
        LambdaQueryWrapper<Reply> queryWrapper = new LambdaQueryWrapper<>();
        queryWrapper.eq(Reply::getRpFid, postId)
                .orderByAsc(Reply::getRpTime);
                
        Page<Reply> replyPage = replyService.page(new Page<>(page, pageSize), queryWrapper);
        
        List<GetReplyDto> dtoList = replyPage.getRecords().stream()
            .map(reply -> GetReplyDto.from(
                reply,
                userService.getById(reply.getRpUid()).getUName()
            ))
            .collect(Collectors.toList());
        
        Page<GetReplyDto> resultPage = new Page<>(replyPage.getCurrent(), replyPage.getSize(), replyPage.getTotal());
        resultPage.setRecords(dtoList);
        return Result.success(resultPage, "查询成功");
    }

    /**
     * 删除帖子（仅能删除自己的发布）
     * @param postId 帖子ID
     * @return 删除结果
     */
    @DeleteMapping("/{postId}")
    @ApiOperation(value = "删除帖子", notes = "删除指定帖子，仅能删除自己发布的帖子")
    @ApiImplicitParam(name = "postId", value = "帖子ID", required = true, dataType = "int", paramType = "path")
    public Result<String> deletePost(@PathVariable Integer postId) {
        Integer userId = getCurrentUserId();
        Post post = postService.getById(postId);
        
        if (post == null) {
            return Result.error(0, "帖子不存在");
        }
        if (!post.getFUid().equals(userId)) {
            return Result.error(0, "只能删除自己的帖子");
        }
        
        postService.removeById(postId);
        return Result.success("删除成功");
    }
    
    /**
     * 删除回复（仅能删除自己的回复）
     * @param replyId 回复ID
     * @return 删除结果
     */
    @DeleteMapping("/reply/{replyId}")
    @ApiOperation(value = "删除回复", notes = "删除指定回复，仅能删除自己发布的回复")
    @ApiImplicitParam(name = "replyId", value = "回复ID", required = true, dataType = "int", paramType = "path")
    public Result<String> deleteReply(@PathVariable Integer replyId) {
        Integer userId = getCurrentUserId();
        Reply reply = replyService.getById(replyId);
        
        if (reply == null) {
            return Result.error(0, "回复不存在");
        }
        if (!reply.getRpUid().equals(userId)) {
            return Result.error(0, "只能删除自己的回复");
        }
        
        replyService.removeById(replyId);
        return Result.success("删除成功");
    }
    
    /**
     * 点赞帖子
     * @param postId 帖子ID
     * @return 点赞结果
     */
    @PutMapping("/like/{postId}")
    @ApiOperation(value = "点赞帖子", notes = "为指定帖子点赞")
    @ApiImplicitParam(name = "postId", value = "帖子ID", required = true, dataType = "int", paramType = "path")
    public Result<String> likePost(@PathVariable Integer postId) {
        Post post = postService.getById(postId);
        
        if (post == null) {
            return Result.error(0, "帖子不存在");
        }
        
        post.setFLike(post.getFLike() + 1);
        postService.updateById(post);
        
        return Result.success("点赞成功");
    }
    
    @PutMapping("/reply/like/{replyId}")
    @ApiOperation(value = "点赞回复", notes = "为指定回复点赞")
    @ApiImplicitParam(name = "replyId", value = "回复ID", required = true, dataType = "int", paramType = "path")
    public Result<String> likeReply(@PathVariable Integer replyId) {
        Reply reply = replyService.getById(replyId);
        
        if (reply == null) {
            return Result.error(0, "回复不存在");
        }
        
        reply.setRpLike(reply.getRpLike() + 1);
        replyService.updateById(reply);
        
        return Result.success("点赞成功");
    }
}