package com.uber.rides.service.messages;

import lombok.Setter;

import org.thymeleaf.context.Context;
import org.thymeleaf.spring6.SpringTemplateEngine;

import java.util.Map;

@Setter
public abstract class EmailMessage {
    protected Map<String, Object> templateMap;
    protected String template;

    public String getHtmlBody(SpringTemplateEngine thymeleafTemplateEngine) {
        Context thymeleafContext = new Context();
        thymeleafContext.setVariables(templateMap);
        return thymeleafTemplateEngine.process(template, thymeleafContext);
    }

    public abstract String getSubject();
}
