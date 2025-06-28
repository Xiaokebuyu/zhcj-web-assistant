package top.mole9630.ada.service.impl;

import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import org.springframework.stereotype.Service;
import top.mole9630.ada.entity.Feedback;
import top.mole9630.ada.mapper.FeedbackMapper;
import top.mole9630.ada.service.FeedbackService;

@Service
public class FeedbackServiceImpl extends ServiceImpl<FeedbackMapper, Feedback> implements FeedbackService {

    private final FeedbackMapper feedbackMapper;

    public FeedbackServiceImpl(FeedbackMapper feedbackMapper) {
        this.feedbackMapper = feedbackMapper;
    }

    @Override
    public Feedback saveFeedback(Feedback feedback) {
        feedbackMapper.insert(feedback);
        return feedback;
    }
}
