package top.mole9630.ada.controller;

import cn.dev33.satoken.stp.StpUtil;
import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import io.swagger.annotations.Api;
import io.swagger.annotations.ApiImplicitParam;
import io.swagger.annotations.ApiOperation;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import top.mole9630.ada.common.Result;
import top.mole9630.ada.dto.GetChatDto;
import top.mole9630.ada.entity.Chat;
import top.mole9630.ada.service.ChatService;
import top.mole9630.ada.service.UserService;

import java.util.List;

@RestController
@RequestMapping("/chat")
@Api(tags = "聊天管理")
@CrossOrigin(origins = "http://localhost:8080",allowCredentials = "true")
public class ChatController {
    @Autowired
    private ChatService chatService;
    
    @Autowired
    private UserService userService;

    @GetMapping("/{rid}")
    @ApiOperation(value = "获取聊天记录", notes = "根据求助ID获取聊天记录")
    @ApiImplicitParam(name = "rid", value = "求助编号", required = true, paramType = "path")
    public Result<List<GetChatDto>> getChatHistory(@PathVariable Integer rid) {
        QueryWrapper<Chat> queryWrapper = new QueryWrapper<>();
        queryWrapper.eq("c_rid", rid);
        return Result.success(chatService.list(queryWrapper).stream()
            .map(chat -> {
                String userName = userService.getById(chat.getCUid()).getUName();
                return GetChatDto.from(chat, userName);
            }).collect(java.util.stream.Collectors.toList()));
    }

    @PostMapping("/message")
    @ApiOperation(value = "发送消息", notes = "创建新的聊天记录")
    @ApiImplicitParam(name = "chat", value = "聊天消息实体", required = true, dataType = "Chat")
    public Result<Chat> sendMessage(@RequestBody Chat chat) {
        chat.setCTime(new java.util.Date());
        chat.setCUid(StpUtil.getLoginIdAsInt());
        chatService.save(chat);
        return Result.success(chat);
    }

    @DeleteMapping("/message/{cid}")
    @ApiOperation(value = "删除消息", notes = "根据消息ID删除聊天记录")
    @ApiImplicitParam(name = "cid", value = "消息编号", required = true, paramType = "path")
    public Result<String> deleteMessage(@PathVariable Integer cid) {
        chatService.removeById(cid);
        return Result.success("消息删除成功");
    }
}