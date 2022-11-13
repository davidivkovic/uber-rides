package com.uber.rides.controller;

import java.time.LocalDateTime;

import javax.validation.constraints.NotBlank;

import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MaxUploadSizeExceededException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.FileSystemResource;
import org.springframework.http.MediaType;
import org.springframework.security.access.annotation.Secured;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;

import static com.speedment.jpastreamer.streamconfiguration.StreamConfiguration.*;

import com.uber.rides.database.DbContext;
import com.uber.rides.dto.user.UpdateRequest;
import com.uber.rides.model.*;
import com.uber.rides.service.ImageStore;
import static com.uber.rides.Utils.*;

@RestController
@RequestMapping("/users")
public class Users extends Controller {

    @Autowired DbContext context;

    @ExceptionHandler({ MaxUploadSizeExceededException.class })
    public Object handleFilesizeExceeded() {
        return badRequest("Maximum allowed file size is 5MB.");
    }

    @GetMapping(path = "/pictures/{id}", produces = { MediaType.IMAGE_PNG_VALUE, MediaType.IMAGE_JPEG_VALUE })
    public Object getProfilePicture(@PathVariable("id") @NotBlank String imageId) {

        var imagePath = ImageStore.getPath(imageId);
        if (imagePath == null) return notFound();

        return new FileSystemResource(imagePath);

    }
    
    @Transactional
    @PostMapping(path = "/update", consumes = { MediaType.MULTIPART_FORM_DATA_VALUE })
    @Secured({ User.Roles.DRIVER, User.Roles.RIDER })
    public Object update(@ModelAttribute @Validated UpdateRequest request) {
        
        var user = context.query().stream(of(User.class).joining(User$.updateRequest))
            .filter(User$.id.equal(authenticatedUserId()))
            .findFirst()
            .orElse(null);
        if (user == null) return badRequest("User does not exist.");

        var updateRequest = user.getUpdateRequest();
        if (updateRequest == null) updateRequest = new UserUpdateRequest();

        modelMapper.map(request, updateRequest);
        updateRequest.setRequestedAt(LocalDateTime.now());

        var image = request.getProfilePictureFile();
        if (image != null && !image.isEmpty()) {
            var imageName = ImageStore.persist(image);
            if (imageName == null) return badRequest("Accepted image extensions are .PNG and .JPEG.");
            
            updateRequest.setProfilePicture(imageName);
        }

        user.setUpdateRequest(updateRequest);
        context.db().persist(updateRequest);

        return ok();

    }
    
    @Transactional
    @PostMapping("/{id}/update")
    @Secured({ User.Roles.ADMIN })
    public Object update(@PathVariable("id") @NotBlank Long userId, @RequestParam String action) {

        action = action.toUpperCase();
        if (!action.matches("ACCEPT|REJECT")) {
            return badRequest("Invalid action. Valid actions are: ACCEPT, REJECT.");
        }

        var user = context.query().stream(of(User.class).joining(User$.updateRequest))
            .filter(User$.id.equal(userId))
            .findFirst()
            .orElse(null);
        if (user == null) return badRequest("User does not exist.");

        var updateRequest = user.getUpdateRequest();
        if (updateRequest == null) {
            return badRequest("User has no pending update requests.");
        }

        if (action.equals("ACCEPT")) {
            modelMapper.map(updateRequest, user);
            user.setUpdateRequest(null);
        }

        context.db().remove(updateRequest);

        return ok();

    }
    
}