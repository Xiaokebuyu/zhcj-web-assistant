package top.mole9630.ada.dto;

import lombok.Data;
import top.mole9630.ada.entity.Request;

@Data
public class GetRequestDto {
    private Request request;
    private String hName;
    private String vName;

    public GetRequestDto(Request request) {
        this.request = request;
    }
}