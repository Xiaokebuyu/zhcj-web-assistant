package top.mole9630.ada.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import top.mole9630.ada.entity.Post;

import java.util.Date;

@Data
@AllArgsConstructor
public class GetPostDto {
    private Integer fId;
    private Integer fType;
    private String fTitle;
    private String fContent;
    private Integer fUid;
    private Date fTime;
    private Integer fLike;
    private int replyCount;
    private String uName;


    public static GetPostDto from(Post post, int replyCount, String uName) {
        return new GetPostDto(
            post.getFId(),
            post.getFType(),
            post.getFTitle(),
            post.getFContent(),
            post.getFUid(),
            post.getFTime(),
            post.getFLike(),
            replyCount,
            uName
        );
    }
}