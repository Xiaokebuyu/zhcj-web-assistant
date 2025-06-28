package top.mole9630.ada.controller;
import cn.dev33.satoken.exception.NotLoginException;
import cn.dev33.satoken.stp.StpUtil;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.github.xiaoymin.knife4j.annotations.DynamicParameter;
import com.github.xiaoymin.knife4j.annotations.DynamicParameters;
import io.swagger.annotations.Api;
import io.swagger.annotations.ApiOperation;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang.StringUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.util.DigestUtils;
import org.springframework.web.bind.annotation.*;
import top.mole9630.ada.common.Result;
import top.mole9630.ada.dto.UserLoginDto;
import top.mole9630.ada.dto.UserUpdateDto;
import top.mole9630.ada.dto.UserUpdatePasswordDto;
import top.mole9630.ada.entity.User;
import top.mole9630.ada.service.UserService;
import top.mole9630.ada.utils.ValidateCodeUtils;

import javax.servlet.http.HttpServletRequest;
import java.util.Map;
import java.util.HashMap;

@RestController
@RequestMapping("/user")
@CrossOrigin(origins = {"http://localhost:8080", "http://localhost:8081", "http://localhost:3000"}, allowCredentials = "true")
@Api(tags = "用户相关接口")
@Slf4j
public class UserController {
    @Autowired
    private UserService userService;
    @Autowired
    private RedisTemplate redisTemplate;

    /**
     * 发送手机验证码
     *
     * @param user 用户对象(主要接收手机号参数)
     * @return 结果
     */
    @PostMapping("/sendLoginCodeMsg")
    @ApiOperation(value = "发送手机验证码")
    @DynamicParameters(name = "用户信息", properties = {
            @DynamicParameter(value = "手机号", name = "phone", dataTypeClass = String.class, required = true, example = "138123456789")
    })
    public Result<String> sendMsg(@RequestBody User user) {
        // 获取手机号
        String phone = user.getUPhone();

        if (StringUtils.isNotEmpty(phone)) {
            // 生成随机的6位数验证码
            String code = ValidateCodeUtils.generateValidateCode(6).toString();
            log.info("手机号{}的验证码为:{} (5分钟内有效)", phone, code);

            // 调用短信服务发送验证码
//            SMSUtils.sendMessage("签名", "模板编码", phone, code);

            // 将验证码存入session
//            session.setAttribute(phone, code);
            // 将验证码存入redis中并设置有效期为5分钟
            String key = "PhoneCAPTCHA_" + phone;
//            redisTemplate.opsForValue().set(key, code, 300, TimeUnit.SECONDS);
            return Result.success(null, "验证码发送成功");
        }
        return Result.error(0, "验证码发送失败");
    }

    /**
     * 用户注册
     *
     * @param userLoginDto 用户登录对象
     * @return 结果
     */
    @PostMapping("/register")
    @ApiOperation(value = "用户注册")
    public Result<User> register(@RequestBody UserLoginDto userLoginDto) {
        // 从redis中获取验证码
//        String key = "PhoneCAPTCHA_" + userLoginDto.getPhone();
//        String redisCode = (String) redisTemplate.opsForValue().get(key);

        // 判断验证码是否正确
//        if (StringUtils.isEmpty(userLoginDto.getPhoneCAPTCHA()) || !userLoginDto.getPhoneCAPTCHA().equals(redisCode)) {
//            return Result.error(0, "手机验证码错误, 请重新输入");
//        }

        // 验证昵称格式(只允许字母、数字和下划线)
        if (!userLoginDto.getName().matches("^[a-zA-Z0-9_]+$")) {
            return Result.error(0, "昵称只能包含字母、数字和下划线");
        }
        // 判断手机号是否已经注册
        LambdaQueryWrapper<User> queryWrapper = new LambdaQueryWrapper<>();
        queryWrapper.eq(User::getUPhone, userLoginDto.getPhone());
        User u = userService.getOne(queryWrapper);
        if (u != null) {
            return Result.error(0, "该手机号已经注册, 请重新输入");
        }
        // 将页面提交的密码password进行md5加密处理
        String password = DigestUtils.md5DigestAsHex(userLoginDto.getPassword().getBytes());
        // 将加密后的密码设置到user对象中并初始化相关值
        User user = new User();
        user.setUPhone(userLoginDto.getPhone());
        user.setUPassword(password);
        user.setUName(userLoginDto.getName());
        user.setUType(userLoginDto.getType());
        user.setUScore(0);
        userService.save(user);
        // 返回注册成功结果
        return Result.success(user, "注册成功");
    }

    /**
     * 用户登录
     *
     * @param request 请求对象
     * @param userDto 用户对象(主要接收手机号和密码参数)
     * @return 结果
     */
    @PostMapping("/login")
    @ApiOperation(value = "用户登录")
    public Result<Map<String, Object>> login(HttpServletRequest request, @RequestBody UserLoginDto userDto) {
        // 1.将页面提交的密码password进行md5加密处理
        String password = userDto.getPassword();
        password = DigestUtils.md5DigestAsHex(password.getBytes());
    
        // 2.根据loginType决定查询条件(0:用户名，1:手机号)
        LambdaQueryWrapper<User> queryWrapper = new LambdaQueryWrapper<>();
        if (userDto.getLoginType() == 0) {
            // 验证昵称格式(只允许字母、数字和下划线)
            if (userDto.getName() == null) {
                return Result.error(0, "用户名不能为空！");
            } else if (!userDto.getName().matches("^[a-zA-Z0-9_]+$")) {
                return Result.error(0, "用户名只能包含字母、数字和下划线！");
            }
            queryWrapper.eq(User::getUName, userDto.getName());
        } else {  
            queryWrapper.eq(User::getUPhone, userDto.getPhone());
        }
    
        // 3.执行查询和验证逻辑
        User u = userService.getOne(queryWrapper);
        if (u == null) {
            // 根据loginType返回不同的错误信息
            if (userDto.getLoginType() == 0) {
                return Result.error(0, "用户名不存在");
            } else {
                return Result.error(0, "手机号不存在");
            }
        }
        if (!u.getUPassword().equals(password)) {
            return Result.error(0, "密码错误");
        }
    
        // 4.登录成功
        StpUtil.login(u.getUId());

        // 将 token 与用户信息一起返回，便于跨域前端（如 AI 助手）在 header 中携带
        Map<String, Object> result = new HashMap<>();
        result.put("user", u);
        result.put("token", StpUtil.getTokenValue()); // 显式返回 token 字符串

        return Result.success(result, "登录成功");
    }

    /**
     * 用户短信验证码登录
     *
     * @param request 请求对象
     * @param map     接受手机号和验证码参数
     * @return 结果
     */
    @PostMapping("/codeMsgLogin")
    @ApiOperation(value = "用户短信验证码登录")
    public Result<User> codeMsgLogin(HttpServletRequest request, @RequestBody Map map) {
        // 获取手机号
        String phone = map.get("phone").toString();
        // 获取验证码
        String code = map.get("code").toString();
        // 获取session中的验证码
//        Object codeInSession = session.getAttribute(phone);
        // 获取redis中的验证码
        String key = "PhoneCAPTCHA_" + phone;
//        Object codeInRedis = redisTemplate.opsForValue().get(key);
        // 进行验证码比对(提交的验证码 和 redis保存的验证码比对)
//        if (codeInRedis != null && codeInRedis.equals(code)) {
        // 验证码正确,登录成功
        // 判断手机号是否为新用户, 若是自动完成注册
        LambdaQueryWrapper<User> queryWrapper = new LambdaQueryWrapper<>();
//            queryWrapper.eq(User::getPhone, phone);
        User user = userService.getOne(queryWrapper);
        if (user == null) {
            // 新用户, 自动完成注册
            user = new User();
//                user.setPhone(phone);
//                user.setStatus(1);
            userService.save(user);
        }
//            StpUtil.login(user.getId());

        // 如果登录成功, 将验证码从redis中删除
//            redisTemplate.delete(phone);

        return Result.success(user, "登录成功");
    }
    // 验证码错误, 登录失败
//        return Result.error(0, "登录失败");
//}

    /**
     * 判断用户是否登录
     *
     * @return 是否登录结果
     */
    @GetMapping("/is-login")
    @ApiOperation(value = "判断用户是否登录")
    public Result<String> isLogin() {
        return Result.success(null, StpUtil.isLogin() ? "已登录" : "未登录");
    }

    /**
     * 用户退出登录
     *
     * @return 退出登录结果
     */
    @PostMapping("/logout")
    @ApiOperation(value = "用户退出登录")
    public Result<String> logout() {
        StpUtil.logout();
        return Result.success(null, "退出成功");
    }

    /**
     * 踢出用户下线
     *
     * @param userId 用户id
     * @return 踢出结果
     */
    @PostMapping("/kickout")
    @ApiOperation(value = "踢出用户下线")
    public Result<String> kickout(Integer userId) {
        StpUtil.kickout(userId);
        return Result.success(null, "成功踢出该用户下线: " + userId);
    }

    /**
     * 修改密码
     *
     * @param request               请求
     * @param userUpdatePasswordDto 修改密码对象
     * @return 修改结果
     */
    @PutMapping("/update-password")
    @ApiOperation(value = "修改密码")
//    @CrossOrigin(origins = "http://localhost:8080", allowCredentials = "true") // 明确指定前端地址
    public Result<String> updatePassword(HttpServletRequest request, @RequestBody UserUpdatePasswordDto userUpdatePasswordDto) {
        // 根据id查询用户
        String tokenValue = StpUtil.getTokenValue();
        log.info("当前Token:{}",tokenValue);

        if(!StpUtil.isLogin()){
            return Result.error(0, "未登录或Token无效");
        }

//        SaTokenInfo tokenInfo = StpUtil.getTokenInfo();
        int id = StpUtil.getLoginIdAsInt();
        log.info("修改密码得到的id",id);
        User user = userService.getById(id);
        // 获取数据库内的老密码
        String password = user.getUPassword();
        // 将页面提交的密码password进行md5加密处理
        String oldPassword = DigestUtils.md5DigestAsHex(userUpdatePasswordDto.getOldPassword().getBytes());
        // 用户输入的老密码和数据库内的老密码是否一致
        if (password.equals(oldPassword)) {
            if (userUpdatePasswordDto.getNewPassword().equals(userUpdatePasswordDto.getReNewPassword())) {
                // 将新密码进行md5加密
                String newPassword = DigestUtils.md5DigestAsHex(userUpdatePasswordDto.getNewPassword().getBytes());
                // 将页面提交的密码加密设置到查询到的用户对象中
                user.setUPassword(newPassword);
                // 更新用户
                boolean flag = userService.updateById(user);
                if (!flag) {
                    return Result.error(0, "密码修改失败");
                }
                return Result.success(null, "密码修改成功");
            } else {
                return Result.error(0, "两次密码输入不一致");
            }
        } else {
            return Result.error(0, "旧密码输入错误, 请重试");
        }
    }

    /**
     * 修改用户资料
     *
//     * @param user 用户对象
     * @return 修改用户资料结果
     */
    @PutMapping("/update-info")
    @ApiOperation(value = "更新用户资料")
    @CrossOrigin(origins = "http://localhost:8080", allowCredentials = "true")
    public Result<String> updateInfo(@RequestBody UserUpdateDto userUpdateDto) {
        Integer userId = StpUtil.getLoginIdAsInt();

        // 查询现有用户信息
        User existingUser = userService.getById(userId);
        if (existingUser == null) {
            return Result.error(0, "用户不存在");
        }

        // 更新可修改的字段
        if (userUpdateDto.getURealName() != null) {
            existingUser.setURealName(userUpdateDto.getURealName());
        }
        if (userUpdateDto.getUIdentityNumber() != null) {
            existingUser.setUIdentityNumber(userUpdateDto.getUIdentityNumber());
        }
        if (userUpdateDto.getUAddress() != null) {
            existingUser.setUAddress(userUpdateDto.getUAddress());
        }
        if (userUpdateDto.getUInfo() != null) {
            existingUser.setUInfo(userUpdateDto.getUInfo());
        }
        if (userUpdateDto.getULabel() != null) {
            existingUser.setULabel(userUpdateDto.getULabel());
        }

        // 更新用户
        boolean flag = userService.updateById(existingUser);
        if (!flag) {
            return Result.error(0, "个人资料修改失败");
        }
        return Result.success(null, "个人资料修改成功");
    }

    /**
     * 通过id删除用户
     *
     * @param id 用户id
     * @return 删除结果
     */
    @DeleteMapping("/delete")
    @ApiOperation(value = "通过id删除用户")
    public Result<String> deleteById(@RequestParam Integer id) {
        if  (id == null) {
            return Result.error(0, "用户id不能为空");
        }
        boolean flag = userService.removeById(id);
        if (!flag) {
            return Result.error(0, "删除用户失败");
        }
        return Result.success(null, "删除用户成功");
    }

//    查询当前用户ID
    @GetMapping("/current")
    @ApiOperation(value = "获取当前用户信息")
    public Result<User> getCurrentUser() {
        try {
            // 获取当前登录用户ID
            int userId = StpUtil.getLoginIdAsInt();
            log.info("获取当前用户信息，用户ID: {}", userId);

            // 查询用户完整信息
            User user = userService.getById(userId);
            if (user == null) {
                return Result.error(0, "用户不存在或已注销");
            }

            // 可以在这里添加敏感信息过滤逻辑
            user.setUPassword(null); // 移除密码等敏感信息

            return Result.success(user, "获取用户信息成功");
        } catch (NotLoginException e) {
            log.warn("获取当前用户信息失败，用户未登录");
            return Result.error(0, "用户未登录，请先登录");
        } catch (Exception e) {
            log.error("获取当前用户信息异常", e);
            return Result.error(0, "获取用户信息失败");
        }
    }

    /**
     * 查询全部用户信息
     *
     * @param id 用户id(可选)
     * @return 用户信息列表或单个用户信息
     */

    @GetMapping("/query")
    @ApiOperation(value = "查询用户信息")
    public Result<?> getUserById(@RequestParam(required = false) Integer id) {
        if (id != null) {
            User user = userService.getById(id);
            if (user == null) {
                return Result.error(0, "用户不存在");
            }
            return Result.success(user, "查询成功");
        } else {
            return Result.success(userService.list(), "查询成功");
        }
    }
}


