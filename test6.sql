-- look at ridership for each day

CREATE OR REPLACE VIEW for_each_day AS
SELECT servicedate, sum(transactions) AS transactions
FROM latenight
GROUP BY servicedate
ORDER BY servicedate
;
SELECT * FROM for_each_day;
