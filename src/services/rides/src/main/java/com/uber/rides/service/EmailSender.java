package com.uber.rides.service;

import java.nio.charset.StandardCharsets;
import java.util.Base64;

import javax.mail.internet.MimeMessage;

import org.thymeleaf.spring6.SpringTemplateEngine;
import org.thymeleaf.templateresolver.ClassLoaderTemplateResolver;
import org.thymeleaf.templateresolver.ITemplateResolver;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.support.ResourceBundleMessageSource;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.JavaMailSenderImpl;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import com.uber.rides.service.messages.EmailMessage;

@Service
public class EmailSender {

    @Configuration
    public static class EmailConfig {

        @Bean
        public ITemplateResolver thymeleafTemplateResolver() {
            ClassLoaderTemplateResolver templateResolver = new ClassLoaderTemplateResolver();
            templateResolver.setPrefix("email-templates/");
            templateResolver.setSuffix(".html");
            templateResolver.setTemplateMode("HTML");
            templateResolver.setCharacterEncoding("UTF-8");
            return templateResolver;
        }

        @Bean
        public ResourceBundleMessageSource emailMessageSource() {
            ResourceBundleMessageSource messageSource = new ResourceBundleMessageSource();
            messageSource.setBasename("mailMessages");
            return messageSource;
        }

        @Bean
        public SpringTemplateEngine thymeleafTemplateEngine(ITemplateResolver templateResolver) {
            SpringTemplateEngine templateEngine = new SpringTemplateEngine();
            templateEngine.setTemplateResolver(templateResolver);
            templateEngine.setTemplateEngineMessageSource(emailMessageSource());
            return templateEngine;
        }

        @Bean
        public JavaMailSender getJavaMailSender() {
            var mailSender = new JavaMailSenderImpl();
            mailSender.setHost("smtp.gmail.com");
            mailSender.setPort(587);
            
            mailSender.setUsername("isamrsadventure@gmail.com");
            mailSender.setPassword(new String(Base64.getDecoder().decode("bWlobmJuaWJiaHVrc3pycA=="), StandardCharsets.UTF_8));
            
            var props = mailSender.getJavaMailProperties();
            props.put("mail.transport.protocol", "smtp");
            props.put("mail.smtp.auth", "true");
            props.put("mail.smtp.starttls.enable", "true");
            
            return mailSender;
        }
    }
    private final JavaMailSender mailSender;
    private final SpringTemplateEngine templateEngine;

    public EmailSender(JavaMailSender mailSender, SpringTemplateEngine templateEngine) {
        this.mailSender = mailSender;
        this.templateEngine = templateEngine;
    }

    @Async
    public void send(String to, EmailMessage emailMessage) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setFrom("Uber", "Uber");
            helper.setTo(to);
            helper.setSubject(emailMessage.getSubject());
            helper.setText(emailMessage.getHtmlBody(templateEngine), true);
            mailSender.send(message);
        }
        catch (Exception e) { /* Not much we can do here except logging a message */ }
    }
}
