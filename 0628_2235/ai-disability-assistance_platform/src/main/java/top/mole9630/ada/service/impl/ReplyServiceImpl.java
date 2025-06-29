package top.mole9630.ada.service.impl;

import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import org.springframework.stereotype.Service;
import top.mole9630.ada.entity.Reply;
import top.mole9630.ada.mapper.ReplyMapper;
import top.mole9630.ada.service.ReplyService;

@Service
public class ReplyServiceImpl extends ServiceImpl<ReplyMapper, Reply> implements ReplyService {
}