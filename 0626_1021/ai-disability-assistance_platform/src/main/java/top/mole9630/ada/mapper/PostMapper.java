package top.mole9630.ada.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import org.apache.ibatis.annotations.Mapper;
import top.mole9630.ada.entity.Post;

@Mapper
public interface PostMapper extends BaseMapper<Post> {
}