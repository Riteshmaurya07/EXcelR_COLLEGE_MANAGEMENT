package com.college.cms.repository;

import com.college.cms.entity.Holiday;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.Optional;

@Repository
public interface HolidayRepository extends JpaRepository<Holiday, Long> {
    boolean existsByDate(LocalDate date);
    Optional<Holiday> findByDate(LocalDate date);
    java.util.List<Holiday> findAllByOrderByDateAsc();
}
