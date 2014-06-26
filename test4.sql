-- look at ridership from before midnight for each day (Friday nights)

CREATE OR REPLACE VIEW fri_before_midnight AS
SELECT servicedate, sum(transactions) AS before_midnight
FROM latenight
WHERE extract(hour from starttime) > 5 AND extract(dow from servicedate) = 5
GROUP BY servicedate
ORDER BY servicedate
;


-- look at ridership from midnight onwards for each day (Friday nights)

CREATE OR REPLACE VIEW fri_after_midnight AS
SELECT servicedate, sum(transactions) AS after_midnight
FROM latenight
WHERE extract(hour from starttime) < 5 AND extract(dow from servicedate) = 5
GROUP BY servicedate
ORDER BY servicedate
;


SELECT * FROM fri_before_midnight JOIN fri_after_midnight USING (servicedate);
