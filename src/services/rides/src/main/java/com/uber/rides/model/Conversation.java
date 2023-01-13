package com.uber.rides.model;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import javax.persistence.Column;
import javax.persistence.ElementCollection;
import javax.persistence.Embeddable;
import javax.persistence.Entity;
import javax.persistence.FetchType;
import javax.persistence.GeneratedValue;
import javax.persistence.Id;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;
import javax.persistence.OrderBy;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@Entity
@NoArgsConstructor
@AllArgsConstructor
public class Conversation {

    public Conversation(User admin, User client) {
        this.admin = admin;
        this.client = client;
        this.messages = new ArrayList<>();
        this.closed = false;
    }

    public Message addMessage(User sender, String content) {
        var message = new Message(sender, content);
        messages.add(message);
        return message;
    }

    @Id @GeneratedValue Long id;
    @ElementCollection(fetch = FetchType.EAGER) @OrderBy("sentAt") List<Message> messages;
    boolean closed;
    LocalDateTime closedAt;

    @ManyToOne(fetch = FetchType.EAGER) 
    @JoinColumn(name = "admin_id")
    User admin;

    @ManyToOne(fetch = FetchType.EAGER) 
    @JoinColumn(name = "client_id") 
    User client;

    @Column(name = "admin_id", insertable = false, updatable = false) 
    Long adminId;

    @Column(name = "client_id", insertable = false, updatable = false) 
    Long clientId;

}
