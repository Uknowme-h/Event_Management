## bonus sql questions

---

### q1 — current designation of every employee

for each employee we want the single most recent designation, meaning the one with the highest effective_date.

the straightforward way to do this is to rank each employee's rows by effective_date descending and then pick only the first one per employee. in sql this looks like using a window function — row_number() partitioned by emp_id and ordered by effective_date descending. any row where that rank equals 1 is the current designation.

```sql
select emp_id, emp_name, designation as current_designation
from (
  select
    emp_id,
    emp_name,
    designation,
    row_number() over (partition by emp_id order by effective_date desc) as rn
  from emp_designation_log
) ranked
where rn = 1;
```

if two rows share the exact same effective_date for the same employee (like t007 and t008 for carol), the result will be one of them arbitrarily — you could add a secondary sort on txn_id to make it deterministic.

---

### q2 — designation timeline with previous and next

for each row we want to see what designation came just before it and what comes right after, for the same employee. this is a classic use case for lag() and lead() window functions, both partitioned by emp_id and ordered by effective_date.

lag() looks back one row, lead() looks forward one row. if there is no previous or next row for that employee, both naturally return null which is exactly what the question asks for.

```sql
select
  emp_id,
  effective_date,
  lag(designation)  over (partition by emp_id order by effective_date) as previous_designation,
  designation,
  lead(designation) over (partition by emp_id order by effective_date) as next_designation
from emp_designation_log
order by emp_id, effective_date;
```

one thing to be careful about here is duplicate effective_dates for the same employee. in those cases the ordering between the two rows is ambiguous and lag/lead could return unexpected results. adding txn_id as a tiebreaker in the order by would help.

---

### q4 — designation held at the time of each allocation

this one is trickier because the designation table has no end date column. we only know when each designation started, not when it ended. so to find the designation that was active on a given allocation_start date, we need to derive it ourselves.

the logic is: for a given employee on a given date, the active designation is the one with the most recent effective_date that is still on or before that date. anything with an effective_date after the allocation_start would not have been in effect yet.

one clean way to do this is with a correlated subquery or a lateral join. the idea is — for each allocation row, go into the designation table, filter to rows for the same employee where effective_date is on or before allocation_start, then pick the one with the maximum effective_date.

```sql
select
  a.allocation_id,
  a.emp_id,
  d_active.emp_name,
  a.project_name,
  a.allocated_role,
  a.allocation_start,
  d_active.designation as designation_at_allocation
from emp_allocation_log a
join emp_designation_log d_active
  on d_active.emp_id = a.emp_id
  and d_active.effective_date = (
    select max(effective_date)
    from emp_designation_log d_inner
    where d_inner.emp_id = a.emp_id
      and d_inner.effective_date <= a.allocation_start
  )
order by a.allocation_id;
```

the edge case the question mentions is when an employee has no designation record before their allocation_start — meaning the subquery returns null. in that case the join finds no match and the allocation row simply drops from the result. if we want to keep it, we switch to a left join and the designation_at_allocation column would come back as null, which honestly is the most honest answer — we just don't know what they were at that point.
