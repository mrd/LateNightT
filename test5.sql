-- look at ridership from before midnight for each day (Sat nights)

CREATE OR REPLACE VIEW sat_before_midnight AS
SELECT servicedate, sum(transactions) AS before_midnight
FROM latenight
WHERE extract(hour from starttime) > 5 AND extract(dow from servicedate) = 6
GROUP BY servicedate
ORDER BY servicedate
;


-- look at ridership from midnight onwards for each day (Sat nights)

CREATE OR REPLACE VIEW sat_after_midnight AS
SELECT servicedate, sum(transactions) AS after_midnight
FROM latenight
WHERE extract(hour from starttime) < 5 AND extract(dow from servicedate) = 6
GROUP BY servicedate
ORDER BY servicedate
;


SELECT * FROM sat_before_midnight JOIN sat_after_midnight USING (servicedate);
