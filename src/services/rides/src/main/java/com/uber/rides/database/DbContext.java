package com.uber.rides.database;

import javax.persistence.EntityManager;
import javax.persistence.EntityManagerFactory;
import javax.persistence.PersistenceContext;

import org.hibernate.Session;
import org.hibernate.engine.spi.SessionFactoryDelegatingImpl;
import org.hibernate.internal.SessionFactoryImpl;

import com.speedment.jpastreamer.application.JPAStreamer;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Scope;
import org.springframework.stereotype.Repository;

@Repository
@Scope("prototype")
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

    @Autowired private EntityManagerFactory dbFactory;
    @PersistenceContext EntityManager db;
    @Autowired JPAStreamer readonlyQuery;
    JPAStreamer query;


    public JPAStreamer query() {
        if (query == null) {
            query = JPAStreamer.of(new Factory(db));
        }

        return query;
    }

    public JPAStreamer readonlyQuery() {
        return readonlyQuery;
    }

    public EntityManager db() {
        return db;
    }

    public EntityManager createDb() {
        return dbFactory.createEntityManager();
    }

}