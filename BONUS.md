## bonus sql questions

---

### q1 — current designation of every employee

for each employee we want the single most recent designation, meaning the one with the highest effective_date.

the straightforward way to do this is to rank each employee's rows by effective_date descending and then pick only the first one per employee. in sql this looks like using a window function - row_number() partitioned by emp_id and ordered by effective_date descending. any row where that rank equals 1 is the current designation.

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

if two rows share the exact same effective_date for the same employee (like t007 and t008 for carol), the result will be one of them arbitrarily , you could add a secondary sort on txn_id to make it deterministic.

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

a clean way to do this is to first use lead() to turn each designation row into a period with a start and an end, then join the allocations on that range. this avoids referencing the same table twice in the same query, which some databases don't allow.

```sql
with d_with_period as (
  select
    emp_id,
    emp_name,
    designation,
    effective_date,
    lead(effective_date) over (
      partition by emp_id
      order by effective_date, txn_id
    ) as period_end
  from emp_designation_log
)
select
  a.allocation_id,
  a.emp_id,
  d.emp_name,
  a.project_name,
  a.allocated_role,
  a.allocation_start,
  d.designation as designation_at_allocation
from emp_allocation_log a
join d_with_period d
  on  d.emp_id = a.emp_id
  and d.effective_date  <= a.allocation_start
  and (d.period_end is null or d.period_end > a.allocation_start)
order by a.allocation_id;
```

the logic is: a designation was active on allocation_start if it had already started (effective_date <= allocation_start) and the next designation hadn't kicked in yet (period_end > allocation_start, or there is no next one). the txn_id in the order by breaks ties when two rows share the same effective_date.

the edge case the question mentions is when an employee has no designation record before their allocation_start ,in that case the join finds no match and the row drops from the result. switching to a left join keeps it with a null designation_at_allocation, which is the most honest answer , we simply don't have data for that period.