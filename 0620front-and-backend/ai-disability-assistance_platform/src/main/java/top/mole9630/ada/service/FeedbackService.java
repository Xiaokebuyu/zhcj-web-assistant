package top.mole9630.ada.service;

import com.baomidou.mybatisplus.extension.service.IService;
import top.mole9630.ada.entity.Feedback;

public interface FeedbackService extends IService<Feedback> {

    Feedback saveFeedback(Feedback feedback);
}