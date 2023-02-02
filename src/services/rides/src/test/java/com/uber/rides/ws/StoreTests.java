package com.uber.rides.ws;

import org.junit.jupiter.api.*;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;

import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import static org.mockito.Mockito.verify;

import org.springframework.web.socket.WebSocketSession;
import org.springframework.beans.factory.config.AutowireCapableBeanFactory;

import com.uber.rides.model.User;

class StoreTests {

    @Mock
    private AutowireCapableBeanFactory mockBeanFactory;

    @InjectMocks
    private Store store;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void testPut_newUser_changesStoreSize() {
        User user = new User();
        user.setId(1L);
        user.setRole(User.Roles.DRIVER);
        WebSocketSession session = null; // Dummy WebSocketSession object
        UserData actualDriverData = store.put(user, session);;

        assertEquals(user, actualDriverData.getUser());
        assertEquals(1, store.drivers.size());
        assertEquals(1, store.index.size());

        verify(mockBeanFactory).autowireBean(actualDriverData);
    }

    @Test
    void testGet_newUser_userDataFound() {
        User user = new User();
        user.setId(2L);
        user.setRole(User.Roles.DRIVER);
        WebSocketSession session = null; // Dummy WebSocketSession object
        UserData expectedDriverData = store.put(user, session);
        UserData actualDriverData = store.get(2L);

        assertEquals(expectedDriverData, actualDriverData);
    }

    @Test
    void testGet_nonExistingUser_userDataNotFound() {
        UserData actualDriverData = store.get(3L);
        assertNull(actualDriverData);
    }

}
