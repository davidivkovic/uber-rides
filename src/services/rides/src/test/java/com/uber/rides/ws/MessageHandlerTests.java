package com.uber.rides.ws;

import org.junit.jupiter.api.*;

import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import static org.mockito.Mockito.*;

import org.springframework.beans.BeansException;
import org.springframework.beans.factory.config.AutowireCapableBeanFactory;
import org.springframework.context.annotation.Lazy;

import com.uber.rides.model.User;
import com.uber.rides.ws.admin.AdminData;
import com.uber.rides.ws.driver.DriverData;
import com.uber.rides.ws.driver.messages.in.UpdateLocation;
import com.uber.rides.ws.rider.RiderData;
import com.uber.rides.ws.rider.messages.in.AnswerTripInvite;

public class MessageHandlerTests {

    @Mock
    AutowireCapableBeanFactory container;

    @Lazy
    @Mock
    WS ws;

    @InjectMocks
    MessageHandler messageHandler;

    @BeforeEach
    public void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    public void testHandleWithDriverRole() throws BeansException {
        User driver = new User();
        driver.setId(1L);
        driver.setRole(User.Roles.DRIVER);
        DriverData driverData = new DriverData(driver, null);

        UpdateLocation message = mock(UpdateLocation.class);
        when(container.getBean(UpdateLocation.class)).thenReturn(message);

        doNothing().when(message).handle(driverData);

        messageHandler.handle(driverData, UpdateLocation.TYPE, "{}");

        verify(message).handle(driverData);
    }

    @Test
    public void testHandleWithRiderRole() throws BeansException {
        User rider = new User();
        rider.setId(2L);
        rider.setRole(User.Roles.RIDER);
        RiderData riderData = new RiderData(rider, null);

        AnswerTripInvite message = mock(AnswerTripInvite.class);
        when(container.getBean(AnswerTripInvite.class)).thenReturn(message);

        doNothing().when(message).handle(riderData);
        
        messageHandler.handle(riderData, AnswerTripInvite.TYPE, "{}");

        verify(message).handle(riderData);
    }

    @Test
    public void testHandleWithAdminRole() throws BeansException {
        User admin = new User();
        admin.setId(3L);
        admin.setRole(User.Roles.ADMIN);
        AdminData adminData = new AdminData(admin, null);

        EmptyMessage message = mock(EmptyMessage.class);
        MessageHandler.emptyMessage = message;
        when(container.getBean(EmptyMessage.class)).thenReturn(message);

        doNothing().when(message).handle(adminData);

        messageHandler.handle(adminData, "unknown", "{}");

        verify(message).handle(adminData);
    }
    
}