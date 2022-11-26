package com.uber.rides.controller;

import java.time.LocalDateTime;

import javax.servlet.ServletContext;
import javax.validation.constraints.NotBlank;
import javax.validation.constraints.Size;

import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MaxUploadSizeExceededException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.InputStreamResource;
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
import com.uber.rides.dto.user.UserDTO;
import com.uber.rides.model.*;
import com.uber.rides.model.User.Roles;
import com.uber.rides.service.ImageStore;

import static com.uber.rides.Utils.*;

@RestController
@RequestMapping("/users")
public class Users extends Controller {

    static final long PAGE_SIZE = 8;

    @Autowired DbContext context;
    @Autowired ServletContext servlet;
    @Autowired ImageStore images;

    @ExceptionHandler({ MaxUploadSizeExceededException.class })
    public Object handleFilesizeExceeded() {
        return badRequest("Maximum allowed file size is 5MB.");
    }

    @GetMapping(
        path = "/pictures/{id}",
        produces = { MediaType.IMAGE_PNG_VALUE, MediaType.IMAGE_JPEG_VALUE }
    )
    public Object getProfilePicture(@PathVariable("id") @NotBlank String pictureId) {

        if (pictureId.equals(User.DEFAULT_PFP)) {
            return new InputStreamResource(
                getClass().getResourceAsStream("/images/" + User.DEFAULT_PFP)
            );
        }

        var picturePath = images.getPath(pictureId);
        if (picturePath == null) return notFound();

        return new FileSystemResource(picturePath);

    }

    @Transactional
    @GetMapping("/")
    @Secured({ Roles.DRIVER, Roles.RIDER, Roles.ADMIN })
    public Object get() {

        var user = context.readonlyQuery().stream(
                of(User.class)
                .joining(User$.updateRequest)
            )
            .filter(User$.id.equal(authenticatedUserId()))
            .map(u -> mapper.map(u, UserDTO.class))
            .findFirst()
            .orElse(null);
        if (user == null) return badRequest(USER_NOT_EXIST);

        return user;

    }
    
    @Transactional
    @PostMapping(path = "/updates", consumes = { MediaType.MULTIPART_FORM_DATA_VALUE })
    @Secured({ Roles.DRIVER, Roles.RIDER })
    public Object update(@ModelAttribute @Validated UpdateRequest request) {
        
        var user = context.query().stream(
                of(User.class)
                .joining(User$.updateRequest)
            )
            .filter(User$.id.equal(authenticatedUserId()))
            .findFirst()
            .orElse(null);
        if (user == null) return badRequest(USER_NOT_EXIST);

        var updateRequest = user.getUpdateRequest();
        if (updateRequest == null) {
            updateRequest = mapper.map(user, UserUpdateRequest.class);
        }

        mapper.map(request, updateRequest);
        updateRequest.setRequestedAt(LocalDateTime.now());

        var image = request.getProfilePictureFile();
        if (image != null && !image.isEmpty()) {
            var imageName = images.persist(image);
            if (imageName == null) return badRequest("Accepted picture extensions are .PNG and .JPEG.");
            
            updateRequest.setProfilePicture(imageName);
        } else {
            updateRequest.setProfilePicture(user.getProfilePicture());
        }

        if (authenticatedUserRole().equals(Roles.DRIVER)) {
            user.setUpdateRequest(updateRequest);
            context.db().persist(updateRequest);
        }
        else {
            mapper.map(updateRequest, user);
            user.setUpdateRequest(null);
        }

        user.setCompletedRegistration(true);

        return ok();

    }

    @Transactional
    @GetMapping("/updates")
    @Secured({ User.Roles.ADMIN })
    public Object getUpdateRequests(@RequestParam int page) {

        long pageSize = 8;
        return context.query().stream(UserUpdateRequest.class)
            .sorted(UserUpdateRequest$.requestedAt.reversed())
            .skip(page * pageSize)
            .limit(pageSize)
            .toList();
            
    }
    
    @Transactional
    @PostMapping("/{id}/updates")
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
        if (user == null) return badRequest(USER_NOT_EXIST);

        var updateRequest = user.getUpdateRequest();
        if (updateRequest == null) {
            return badRequest("User has no pending update requests.");
        }

        if (action.equals("ACCEPT")) {
            mapper.map(updateRequest, user);
            user.setUpdateRequest(null);
        }

        context.db().remove(updateRequest);

        return ok();

    }

    @Transactional
    @PostMapping("/{id}/block")
    @Secured({ Roles.ADMIN })
    public Object block(@RequestParam boolean blocked, @RequestParam @Size(max = 300) String blockReason) {

        var user = context.db().getReference(User.class, authenticatedUserId());
        if (user == null) {
            return badRequest(USER_NOT_EXIST);
        }

        user.setBlocked(blocked);
        user.setBlockReason(blocked ? blockReason : null);

        return ok();
    }

}