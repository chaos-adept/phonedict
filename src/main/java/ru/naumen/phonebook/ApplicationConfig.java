package ru.naumen.phonebook;

import org.springframework.boot.autoconfigure.EnableAutoConfiguration;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Import;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.data.rest.webmvc.config.RepositoryRestMvcConfiguration;

/**
 * Created by Julia on 31.05.14.
 */
@EnableAutoConfiguration
@ComponentScan
@Configuration
@EnableJpaRepositories
@Import(RepositoryRestMvcConfiguration.class)
public class ApplicationConfig {
}
