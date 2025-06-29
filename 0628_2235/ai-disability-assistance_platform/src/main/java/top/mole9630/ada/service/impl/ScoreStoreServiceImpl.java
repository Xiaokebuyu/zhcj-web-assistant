package top.mole9630.ada.service.impl;

import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import org.springframework.stereotype.Service;
import top.mole9630.ada.entity.ScoreStore;
import top.mole9630.ada.mapper.ScoreStoreMapper;
import top.mole9630.ada.service.ScoreStoreService;

@Service
public class ScoreStoreServiceImpl extends ServiceImpl<ScoreStoreMapper, ScoreStore> implements ScoreStoreService {
}