-- DPMS Sample Seed Data
-- Run AFTER schema.sql

-- spdu_registry (16 SPDUs across 4 feeders)
insert into spdu_registry (spdu_id, lcu_id, feeder_id, feeder_order, lat, lon) values
  ('SPDU-N01','LCU-001',1,0, 6.5020, 3.3980),
  ('SPDU-N02','LCU-001',1,1, 6.5040, 3.3975),
  ('SPDU-N03','LCU-001',1,2, 6.5060, 3.3970),
  ('SPDU-N04','LCU-001',1,3, 6.5080, 3.3965),
  ('SPDU-E01','LCU-001',2,0, 6.5005, 3.4020),
  ('SPDU-E02','LCU-001',2,1, 6.5000, 3.4045),
  ('SPDU-E03','LCU-001',2,2, 6.4995, 3.4070),
  ('SPDU-E04','LCU-001',2,3, 6.4990, 3.4095),
  ('SPDU-S01','LCU-001',3,0, 6.4980, 3.3990),
  ('SPDU-S02','LCU-001',3,1, 6.4960, 3.3985),
  ('SPDU-S03','LCU-001',3,2, 6.4940, 3.3980),
  ('SPDU-S04','LCU-001',3,3, 6.4920, 3.3975),
  ('SPDU-W01','LCU-001',4,0, 6.5005, 3.3960),
  ('SPDU-W02','LCU-001',4,1, 6.5000, 3.3935),
  ('SPDU-W03','LCU-001',4,2, 6.4995, 3.3910),
  ('SPDU-W04','LCU-001',4,3, 6.4990, 3.3885)
on conflict do nothing;

-- fault_events (sample active faults)
insert into fault_events (spdu_id, lcu_id, fault_type, severity, v_a, v_b, v_c, i_a, i_b, i_c, thd_i, lat, lon, resolved, timestamp) values
  ('SPDU-N02','LCU-001','Three-Phase Fault (L-L-L)','CRITICAL', 12.1, 11.8, 13.2, 85.4, 84.1, 86.2, 42.1, 6.5040, 3.3975, false, now() - interval '5 minutes'),
  ('SPDU-E03','LCU-001','Arcing Fault (HIF)','CRITICAL', 180.2, 178.5, 182.1, 45.2, 44.8, 46.1, 38.7, 6.4995, 3.4070, false, now() - interval '12 minutes'),
  ('SPDU-S02','LCU-001','Phase Failure (L-L)','HIGH', 220.1, 0.0, 218.5, 32.1, 0.0, 31.8, 18.2, 6.4960, 3.3985, false, now() - interval '20 minutes'),
  ('SPDU-W01','LCU-001','Energy Theft (Bypass)','HIGH', 219.8, 220.1, 218.9, 55.2, 12.1, 54.8, 22.4, 6.5005, 3.3960, false, now() - interval '35 minutes'),
  ('SPDU-N04','LCU-001','Undervoltage (L-G)','MEDIUM', 185.2, 186.1, 184.8, 28.4, 27.9, 28.1, 8.2, 6.5080, 3.3965, false, now() - interval '1 hour'),
  ('SPDU-E01','LCU-001','Incipient Fault','LOW', 218.5, 219.2, 217.8, 22.1, 21.8, 22.4, 5.1, 6.5005, 3.4020, false, now() - interval '2 hours');

-- transformer_status (sample readings)
insert into transformer_status (lcu_id, i_transformer, i_spdu_sum, i_line_loss, i_residual, dca_anomaly, timestamp) values
  ('LCU-001', 245.2, 228.4, 8.1, 8.7, false, now() - interval '30 seconds'),
  ('LCU-001', 248.1, 229.8, 8.3, 10.0, false, now() - interval '1 minute'),
  ('LCU-001', 251.4, 228.1, 8.2, 15.1, true,  now() - interval '90 seconds'),
  ('LCU-001', 244.8, 227.9, 8.0, 8.9, false, now() - interval '2 minutes'),
  ('LCU-001', 246.3, 229.1, 8.1, 9.1, false, now() - interval '150 seconds');

-- spdu_readings (latest reading per SPDU)
insert into spdu_readings (spdu_id, lcu_id, v_a, v_b, v_c, i_a, i_b, i_c, p_active, q_reactive, pf, thd_i, relay_state, last_gasp, timestamp) values
  ('SPDU-N01','LCU-001', 220.1, 219.8, 220.4, 18.2, 17.9, 18.5, 11.8, 2.1, 0.98, 3.2, 'CLOSED', false, now()),
  ('SPDU-N02','LCU-001', 12.1,  11.8,  13.2,  85.4, 84.1, 86.2, 2.1,  0.8, 0.21, 42.1,'OPEN',   false, now()),
  ('SPDU-N03','LCU-001', 219.5, 220.1, 219.8, 15.1, 14.8, 15.4, 9.8,  1.8, 0.97, 3.8, 'CLOSED', false, now()),
  ('SPDU-N04','LCU-001', 185.2, 186.1, 184.8, 28.4, 27.9, 28.1, 14.2, 3.1, 0.98, 8.2, 'CLOSED', false, now()),
  ('SPDU-E01','LCU-001', 218.5, 219.2, 217.8, 22.1, 21.8, 22.4, 14.1, 2.4, 0.99, 5.1, 'CLOSED', false, now()),
  ('SPDU-E02','LCU-001', 220.8, 221.1, 220.5, 19.8, 19.5, 20.1, 12.8, 2.2, 0.98, 3.5, 'CLOSED', false, now()),
  ('SPDU-E03','LCU-001', 180.2, 178.5, 182.1, 45.2, 44.8, 46.1, 22.1, 5.2, 0.97, 38.7,'OPEN',   false, now()),
  ('SPDU-E04','LCU-001', 219.1, 218.8, 219.5, 16.4, 16.1, 16.8, 10.5, 1.9, 0.98, 4.1, 'CLOSED', false, now()),
  ('SPDU-S01','LCU-001', 220.4, 219.9, 220.8, 21.2, 20.9, 21.5, 13.6, 2.3, 0.99, 3.9, 'CLOSED', false, now()),
  ('SPDU-S02','LCU-001', 220.1, 0.0,   218.5, 32.1, 0.0,  31.8, 8.2,  1.5, 0.98, 18.2,'OPEN',   false, now()),
  ('SPDU-S03','LCU-001', 219.8, 220.2, 219.5, 17.8, 17.5, 18.1, 11.4, 2.0, 0.98, 3.6, 'CLOSED', false, now()),
  ('SPDU-S04','LCU-001', 220.5, 220.1, 220.8, 14.2, 13.9, 14.5, 9.1,  1.7, 0.98, 3.1, 'CLOSED', false, now()),
  ('SPDU-W01','LCU-001', 219.8, 220.1, 218.9, 55.2, 12.1, 54.8, 28.4, 5.1, 0.98, 22.4,'CLOSED', false, now()),
  ('SPDU-W02','LCU-001', 220.2, 219.8, 220.5, 18.9, 18.6, 19.2, 12.1, 2.1, 0.98, 3.7, 'CLOSED', false, now()),
  ('SPDU-W03','LCU-001', 219.5, 220.1, 219.8, 16.8, 16.5, 17.1, 10.8, 1.9, 0.98, 3.4, 'CLOSED', false, now()),
  ('SPDU-W04','LCU-001', 220.8, 220.4, 221.1, 13.5, 13.2, 13.8, 8.7,  1.6, 0.98, 3.0, 'CLOSED', false, now());

-- accounts (sample customers)
insert into accounts (customer_name, meter_number, spdu_id, tariff_band, credit_balance, relay_state, status) values
  ('Adebayo Okafor',    'MTR-001-001', 'SPDU-N01', 'B', 4500.00, 'CLOSED', 'ACTIVE'),
  ('Chioma Nwosu',      'MTR-001-002', 'SPDU-N01', 'C', 1200.50, 'CLOSED', 'ACTIVE'),
  ('Emeka Eze',         'MTR-001-003', 'SPDU-N02', 'A', 0.00,    'OPEN',   'DISCONNECTED'),
  ('Fatima Abdullahi',  'MTR-001-004', 'SPDU-N03', 'B', 8900.00, 'CLOSED', 'ACTIVE'),
  ('Gbenga Adeleke',    'MTR-001-005', 'SPDU-N04', 'D', 320.75,  'CLOSED', 'ACTIVE'),
  ('Hauwa Musa',        'MTR-001-006', 'SPDU-E01', 'C', 2100.00, 'CLOSED', 'ACTIVE'),
  ('Ibrahim Sule',      'MTR-001-007', 'SPDU-E02', 'B', 5600.25, 'CLOSED', 'ACTIVE'),
  ('Jumoke Adesanya',   'MTR-001-008', 'SPDU-E03', 'A', 0.00,    'OPEN',   'SUSPENDED'),
  ('Kelechi Obi',       'MTR-001-009', 'SPDU-E04', 'C', 3400.00, 'CLOSED', 'ACTIVE'),
  ('Lola Fashola',      'MTR-001-010', 'SPDU-S01', 'E', 12500.00,'CLOSED', 'ACTIVE'),
  ('Mohammed Bello',    'MTR-001-011', 'SPDU-S02', 'B', 780.50,  'OPEN',   'DISCONNECTED'),
  ('Ngozi Okonkwo',     'MTR-001-012', 'SPDU-S03', 'C', 2900.00, 'CLOSED', 'ACTIVE'),
  ('Olumide Adeyemi',   'MTR-001-013', 'SPDU-S04', 'B', 4100.75, 'CLOSED', 'ACTIVE'),
  ('Patience Okoro',    'MTR-001-014', 'SPDU-W01', 'D', 650.00,  'CLOSED', 'ACTIVE'),
  ('Rotimi Afolabi',    'MTR-001-015', 'SPDU-W02', 'A', 1800.25, 'CLOSED', 'ACTIVE'),
  ('Sade Balogun',      'MTR-001-016', 'SPDU-W03', 'C', 3200.00, 'CLOSED', 'ACTIVE')
on conflict do nothing;
