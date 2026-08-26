package com.cineplex.dto.movie;

import com.cineplex.entity.enums.AgeRating;
import com.cineplex.entity.enums.MovieStatus;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.*;

import java.time.LocalDate;
import java.util.Set;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MovieUpdateRequest {

    @NotBlank(message = "Tên phim không được để trống")
    @Size(max = 255, message = "Tên phim tối đa 255 ký tự")
    private String title;

    @Size(max = 255, message = "Tên gốc tối đa 255 ký tự")
    private String originalTitle;

    @NotBlank(message = "Slug phim không được để trống")
    @Size(max = 255, message = "Slug tối đa 255 ký tự")
    private String slug;

    @Size(max = 150, message = "Tên đạo diễn tối đa 150 ký tự")
    private String director;

    private String cast;

    private String synopsis;

    @NotNull(message = "Thời lượng phim không được để trống")
    @Min(value = 1, message = "Thời lượng phim phải lớn hơn 0 phút")
    private Integer durationMinutes;

    @NotNull(message = "Ngày khởi chiếu không được để trống")
    private LocalDate releaseDate;

    private LocalDate endDate;

    @NotNull(message = "Phân loại độ tuổi không được để trống")
    private AgeRating ageRating;

    private String posterUrl;
    private String bannerUrl;
    private String trailerUrl;

    @NotNull(message = "Trạng thái phim không được để trống")
    private MovieStatus status;

    private Set<Integer> genreIds;
}
