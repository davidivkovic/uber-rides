package com.uber.rides.database;

import javax.persistence.EntityManager;
import javax.persistence.PersistenceContext;

import com.speedment.jpastreamer.application.JPAStreamer;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Scope;
import org.springframework.stereotype.Repository;

@Repository
@Scope("prototype")
public class DbContext {

    @PersistenceContext EntityManager db;
    JPAStreamer query;

    public EntityManager db() {
        return db;
    }

    public JPAStreamer query() {
        if (query == null) {
            query = JPAStreamer.of(() -> db);
        }

        return query;
    }

    /* compat */
    public JPAStreamer readonlyQuery() {
        return query();
    }

}