-- look at ridership from before midnight for each day

CREATE OR REPLACE VIEW before_midnight AS
SELECT servicedate, sum(transactions) AS before_midnight
FROM latenight
WHERE extract(hour from starttime) > 5
GROUP BY servicedate
ORDER BY servicedate
;
SELECT * FROM before_midnight;

-- select * from before_midnight join after_midnight using (servicedate);
