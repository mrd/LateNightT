-- look at ridership from midnight onwards for each day

CREATE OR REPLACE VIEW after_midnight AS
SELECT servicedate, sum(transactions) AS after_midnight
FROM latenight
WHERE extract(hour from starttime) < 5
GROUP BY servicedate
ORDER BY servicedate
;
SELECT * FROM after_midnight;
