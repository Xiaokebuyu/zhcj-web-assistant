package top.mole9630.ada.dto;

import lombok.Data;
import top.mole9630.ada.entity.Post;

@Data
public class PostWithReplyCountDto {
    private Post post;
    private int replyCount;

    public PostWithReplyCountDto(Post post, int replyCount) {
        this.post = post;
        this.replyCount = replyCount;
    }
}