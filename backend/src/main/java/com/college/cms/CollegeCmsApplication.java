package com.college.cms;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.core.env.Environment;

import java.time.ZoneId;
import java.time.zone.ZoneRules;
import java.time.zone.ZoneRulesProvider;
import java.util.NavigableMap;
import java.util.Set;
import java.util.TreeMap;

@SpringBootApplication
public class CollegeCmsApplication {

    static {
        try {
            ZoneRulesProvider.registerProvider(new ZoneRulesProvider() {
                @Override
                protected Set<String> provideZoneIds() {
                    return Set.of("IST");
                }

                @Override
                protected ZoneRules provideRules(String zoneId, boolean forCaching) {
                    return ZoneId.of("Asia/Kolkata").getRules();
                }

                @Override
                protected NavigableMap<String, ZoneRules> provideVersions(String zoneId) {
                    TreeMap<String, ZoneRules> map = new TreeMap<>();
                    map.put("1", provideRules(zoneId, false));
                    return map;
                }
            });
        } catch (Exception ignored) {
        }
    }

    public static void main(String[] args) {
        SpringApplication app = new SpringApplication(CollegeCmsApplication.class);
        app.addInitializers(context -> {
            Environment env = context.getEnvironment();
            String dbPassword = env.getProperty("spring.datasource.password");
            String jwtSecret = env.getProperty("app.jwt.secret");
            String dbUrl = env.getProperty("spring.datasource.url");

            boolean hasDbPassword = (dbPassword != null && !dbPassword.trim().isEmpty())
                || (dbUrl != null && dbUrl.contains(":") && dbUrl.contains("@"));

            if (!hasDbPassword || jwtSecret == null || jwtSecret.trim().isEmpty()) {
                throw new IllegalStateException("Missing required env var DB_PASSWORD / APP_JWT_SECRET — see README");
            }
        });
        app.run(args);
    }
}
