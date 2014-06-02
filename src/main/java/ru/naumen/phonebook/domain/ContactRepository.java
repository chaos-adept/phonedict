package ru.naumen.phonebook.domain;

import org.springframework.data.domain.*;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.*;
import org.springframework.data.repository.query.Param;
import org.springframework.data.rest.core.annotation.RepositoryRestResource;

@RepositoryRestResource(collectionResourceRel = "contacts", path = "contacts")
public interface ContactRepository extends PagingAndSortingRepository<Contact, Long> {
    @Query("SELECT contact FROM Contact contact WHERE contact.name LIKE CONCAT('%',:name,'%')")
    Page<Contact> findWithPartOfName(@Param("name") String name, Pageable pageable);

    Contact findByNameAndPhoneNumber(String name, String phoneNumber);
}
