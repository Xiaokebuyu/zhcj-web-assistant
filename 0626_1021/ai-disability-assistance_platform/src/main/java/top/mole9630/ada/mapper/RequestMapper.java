package top.mole9630.ada.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import org.apache.ibatis.annotations.Mapper;
import top.mole9630.ada.entity.Request;

@Mapper
public interface RequestMapper extends BaseMapper<Request> {
}