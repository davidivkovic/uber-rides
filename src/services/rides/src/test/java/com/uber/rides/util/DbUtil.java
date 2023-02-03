package com.uber.rides.util;

import javax.persistence.EntityManagerFactory;

public class DbUtil {

    public static void persist(Object entity, EntityManagerFactory emf) {
        var entityManager = emf.createEntityManager();
        entityManager.getTransaction().begin();
        entityManager.persist(entity);
        entityManager.flush();
        entityManager.getTransaction().commit();
    }

    public static void merge(Object entity, EntityManagerFactory emf) {
        var entityManager = emf.createEntityManager();
        entityManager.getTransaction().begin();
        entityManager.merge(entity);
        entityManager.flush();
        entityManager.getTransaction().commit();
    }

}
