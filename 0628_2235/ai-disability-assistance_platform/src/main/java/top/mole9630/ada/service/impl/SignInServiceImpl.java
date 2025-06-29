package top.mole9630.ada.service.impl;

import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import org.springframework.stereotype.Service;
import top.mole9630.ada.entity.SignIn;
import top.mole9630.ada.mapper.SignInMapper;
import top.mole9630.ada.service.SignInService;

@Service
public class SignInServiceImpl extends ServiceImpl<SignInMapper, SignIn> implements SignInService {
}