package top.mole9630.ada.service.impl;

import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import org.springframework.stereotype.Service;
import top.mole9630.ada.entity.Post;
import top.mole9630.ada.mapper.PostMapper;
import top.mole9630.ada.service.PostService;

@Service
public class PostServiceImpl extends ServiceImpl<PostMapper, Post> implements PostService {
}