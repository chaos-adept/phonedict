package ru.naumen.phonebook.domain;

import com.google.common.base.Function;
import com.google.common.collect.Collections2;
import com.google.common.collect.Lists;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.test.annotation.DirtiesContext;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.context.junit4.SpringJUnit4ClassRunner;
import ru.naumen.phonebook.ApplicationConfig;

import javax.validation.ConstraintViolationException;
import java.util.*;

import static org.hamcrest.Matchers.*;
import static org.junit.Assert.assertThat;

/**
 * Created by Julia on 31.05.14.
 */
@RunWith(SpringJUnit4ClassRunner.class)
@DirtiesContext
@ContextConfiguration(classes = ApplicationConfig.class)
@ActiveProfiles( profiles = {"test"} )
public class ContactRepositoryTest {
    @Autowired
    private ContactRepository repository;

    private static final String FAKE_NANE_PREFIX = "fakeUser";
    private static final String FAKE_PHONE = "+799955881";

    private static int counter;

    @Before
    public void before() {
    }

    @Test
    public void shouldAddContact() {
        //Given
        Contact contact = newFakeContact();
        //When
        repository.save(contact);
        //Then
        Contact actual = repository.findOne(contact.getId());

        assertThat(actual, samePropertyValuesAs(contact));
    }

    @Test
    public void shouldAddAndReturnListContact() {
        //Given
        List<Contact> contacts = Lists.newArrayList(newFakeContact(), newFakeContact(), newFakeContact());
        //When
        repository.save(contacts);
        //Then
        Iterable<Contact> actuals = repository.findAll(Collections2.transform(contacts, new Function<Contact, Long>() {
            @Override
            public Long apply(Contact input) {
                return input.getId();
            }
        }));

        int count = 0;
        for (Contact contact : contacts) {
            count++;
            assertThat(actuals, hasItem(samePropertyValuesAs(contact)));
        }
        assertThat(count, is(contacts.size()));
    }

    @Test
    public void shouldRemoveContact() {
        //Given
        Contact contact = newFakeContact();
        repository.save(contact);
        assertThat(repository.findOne(contact.getId()), not(nullValue()));
        //When
        repository.delete(contact.getId());
        //Then
        assertThat(repository.findOne(contact.getId()), nullValue());
    }

    private Contact newFakeContact() {
        return new Contact(FAKE_NANE_PREFIX + (++counter), FAKE_PHONE);
    }

    @Test
    public void shouldSearchByNameSubstring() {
        //Given
        String part = UUID.randomUUID().toString();
        String name = FAKE_NANE_PREFIX + part;
        Contact contact = new Contact(name, FAKE_PHONE);
        repository.save(contact);
        //When
        Contact actual = repository.findWithPartOfName(part, new PageRequest(0, 1)).getContent().get(0);
        //Then
        assertThat(actual, samePropertyValuesAs(contact));
    }

    @Test
    public void shouldSearchByNameAndPoneNumber() {
        //Given
        Contact contact = newFakeContact();
        repository.save(contact);
        //When
        Contact actual = repository.findByNameAndPhoneNumber(contact.getName(), contact.getPhoneNumber());
        //Then
        assertThat(actual, samePropertyValuesAs(contact));
    }

    @Test(expected = ConstraintViolationException.class)
    public void shouldValidatePhoneNumber() {
        //Given
        Contact contact = new Contact(FAKE_NANE_PREFIX, "+   ");
        //When
        repository.save(contact);
        //Then
        //Exception
    }
}
