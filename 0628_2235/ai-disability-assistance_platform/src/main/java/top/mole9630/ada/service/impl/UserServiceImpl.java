package top.mole9630.ada.service.impl;

import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import org.springframework.stereotype.Service;
import top.mole9630.ada.entity.User;
import top.mole9630.ada.mapper.UserMapper;
import top.mole9630.ada.service.UserService;

@Service
public class UserServiceImpl extends ServiceImpl<UserMapper, User> implements UserService {
}