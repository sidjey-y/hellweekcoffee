package com.hellweek.coffee.service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;

@Service
@RequiredArgsConstructor
public class EmailService {
    private final JavaMailSender mailSender;
    private final TemplateEngine templateEngine;

    public void sendMembershipEmail(String to, String membershipId, String firstName) {
        try {
            Context context = new Context();
            context.setVariable("membershipId", membershipId);
            context.setVariable("firstName", firstName);
            
            String htmlContent = templateEngine.process("membership-email", context);
            
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            
            helper.setTo(to);
            helper.setSubject("Welcome to HellWeek Coffee - Your Membership ID");
            helper.setText(htmlContent, true);
            
            mailSender.send(message);
        } catch (MessagingException e) {
            throw new RuntimeException("Failed to send membership email", e);
        }
    }

    public void sendStaffRegistrationEmail(String to, String username, String firstName) {
        try {
            Context context = new Context();
            context.setVariable("username", username);
            context.setVariable("firstName", firstName);
            
            String htmlContent = templateEngine.process("staff-registration-email", context);
            
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            
            helper.setTo(to);
            helper.setSubject("Welcome to HellWeek Coffee - Staff Account Created");
            helper.setText(htmlContent, true);
            
            mailSender.send(message);
        } catch (MessagingException e) {
            throw new RuntimeException("Failed to send staff registration email", e);
        }
    }
}
