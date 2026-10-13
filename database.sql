BEGIN;

CREATE TABLE IF NOT EXISTS public.farmers (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  village VARCHAR(100) NOT NULL,
  sugarcane_supplied_tonnes NUMERIC(10, 2) NOT NULL,
  payment_pending_amount NUMERIC(12, 2) NOT NULL,
  amount_paid NUMERIC(12, 2) NOT NULL
);

INSERT INTO public.farmers (
  name,
  village,
  sugarcane_supplied_tonnes,
  payment_pending_amount,
  amount_paid
)
SELECT *
FROM (
  VALUES
    ('Rahul Shinde', 'Kopargaon', 125.50, 15000.00, 85000.00),
    ('Amit Jadhav', 'Yeola', 90.00, 8000.00, 62000.00),
    ('Sunita Pawar', 'Rahata', 150.75, 22000.00, 98000.00),
    ('Vijay More', 'Shirdi', 75.25, 0.00, 50000.00),
    ('Priya Gaikwad', 'Sakuri', 110.00, 12000.00, 73000.00),
    ('Nitin Wagh', 'Kopargaon', 200.00, 30000.00, 130000.00),
    ('Meena Bhosale', 'Loni', 85.50, 4500.00, 55000.00),
    ('Sanjay Patil', 'Yeola', 175.00, 18000.00, 115000.00),
    ('Kavita Deshmukh', 'Rahata', 60.25, 0.00, 40000.00),
    ('Prakash Kale', 'Shirdi', 135.00, 9500.00, 90000.00)
) AS sample(name, village, tonnes, pending, paid)
WHERE NOT EXISTS (SELECT 1 FROM public.farmers);

COMMIT;
