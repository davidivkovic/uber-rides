package com.uber.rides.database;

import javax.persistence.EntityManager;
import javax.persistence.PersistenceContext;

import org.hibernate.Session;
import org.hibernate.engine.spi.SessionFactoryDelegatingImpl;
import org.hibernate.internal.SessionFactoryImpl;

import org.springframework.stereotype.Repository;
import org.springframework.web.context.annotation.RequestScope;

import com.speedment.jpastreamer.application.JPAStreamer;

@Repository
@RequestScope
public class DbContext {

    private class Factory extends SessionFactoryDelegatingImpl {

        EntityManager db;

        public Factory(EntityManager db) {
            super(db.getEntityManagerFactory().unwrap(SessionFactoryImpl.class));
            this.db = db;
        }

        @Override
        public Session createEntityManager() {
            return (Session) db;
        }
        
    }

    @PersistenceContext EntityManager db;
    JPAStreamer query;

    public JPAStreamer query() {
        if (query == null) {
            query = JPAStreamer.of(new Factory(db));
        }

        return query;
    }

    public EntityManager db() {
        return db;
    }

}