package top.mole9630.ada.service.impl;

import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import org.springframework.stereotype.Service;
import top.mole9630.ada.entity.Request;
import top.mole9630.ada.mapper.RequestMapper;
import top.mole9630.ada.service.RequestService;

@Service
public class RequestServiceImpl extends ServiceImpl<RequestMapper, Request> implements RequestService {
}