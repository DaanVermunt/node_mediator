import os

scenarios = ['scenario1', 'scenario1_1_1_0.4_0.4', 'scenario1_1_1_0.4_0.6', 'scenario1_1_1_0.4_0.8', 'scenario1_1_1_0.6_0.4', 'scenario1_1_1_0.6_0.6', 'scenario1_1_1_0.6_0.8', 'scenario1_1_1_0.8_0.4', 'scenario1_1_1_0.8_0.6', 'scenario1_1_1_0.8_0.8', 'scenario1_1_3_0.4_0.4', 'scenario1_1_3_0.4_0.6', 'scenario1_1_3_0.4_0.8', 'scenario1_1_3_0.6_0.4', 'scenario1_1_3_0.6_0.6', 'scenario1_1_3_0.6_0.8', 'scenario1_1_3_0.8_0.4', 'scenario1_1_3_0.8_0.6', 'scenario1_1_3_0.8_0.8', 'scenario1_1_5_0.4_0.4', 'scenario1_1_5_0.4_0.6', 'scenario1_1_5_0.4_0.8', 'scenario1_1_5_0.6_0.4', 'scenario1_1_5_0.6_0.6', 'scenario1_1_5_0.6_0.8', 'scenario1_1_5_0.8_0.4', 'scenario1_1_5_0.8_0.6', 'scenario1_1_5_0.8_0.8', 'scenario1_3_1_0.4_0.4', 'scenario1_3_1_0.4_0.6', 'scenario1_3_1_0.4_0.8', 'scenario1_3_1_0.6_0.4', 'scenario1_3_1_0.6_0.6', 'scenario1_3_1_0.6_0.8', 'scenario1_3_1_0.8_0.4', 'scenario1_3_1_0.8_0.6', 'scenario1_3_1_0.8_0.8', 'scenario1_3_3_0.4_0.4', 'scenario1_3_3_0.4_0.6', 'scenario1_3_3_0.4_0.8', 'scenario1_3_3_0.6_0.4', 'scenario1_3_3_0.6_0.6', 'scenario1_3_3_0.6_0.8', 'scenario1_3_3_0.8_0.4', 'scenario1_3_3_0.8_0.6', 'scenario1_3_3_0.8_0.8', 'scenario1_3_5_0.4_0.4', 'scenario1_3_5_0.4_0.6', 'scenario1_3_5_0.4_0.8', 'scenario1_3_5_0.6_0.4', 'scenario1_3_5_0.6_0.6', 'scenario1_3_5_0.6_0.8', 'scenario1_3_5_0.8_0.4', 'scenario1_3_5_0.8_0.6', 'scenario1_3_5_0.8_0.8', 'scenario1_5_1_0.4_0.4', 'scenario1_5_1_0.4_0.6', 'scenario1_5_1_0.4_0.8', 'scenario1_5_1_0.6_0.4', 'scenario1_5_1_0.6_0.6', 'scenario1_5_1_0.6_0.8', 'scenario1_5_1_0.8_0.4', 'scenario1_5_1_0.8_0.6', 'scenario1_5_1_0.8_0.8', 'scenario1_5_3_0.4_0.4', 'scenario1_5_3_0.4_0.6', 'scenario1_5_3_0.4_0.8', 'scenario1_5_3_0.6_0.4', 'scenario1_5_3_0.6_0.6', 'scenario1_5_3_0.6_0.8', 'scenario1_5_3_0.8_0.4', 'scenario1_5_3_0.8_0.6', 'scenario1_5_3_0.8_0.8', 'scenario1_5_5_0.4_0.4', 'scenario1_5_5_0.4_0.6', 'scenario1_5_5_0.4_0.8', 'scenario1_5_5_0.6_0.4', 'scenario1_5_5_0.6_0.6', 'scenario1_5_5_0.6_0.8', 'scenario1_5_5_0.8_0.4', 'scenario1_5_5_0.8_0.6', 'scenario1_5_5_0.8_0.8', 'scenario2_showcase_max_automation', 'scenario3_showcase_min_automation', 'scenario4_showcase_min_transitions', 'scenario5_showcase_impact', 'scenario6_showcase_lack_of_cum_impact', 'scenario7_go_up_for_profit', 'scenario7_go_up_for_profit_1_1_1_0.4', 'scenario7_go_up_for_profit_1_1_1_0.6', 'scenario7_go_up_for_profit_1_1_1_0.8', 'scenario7_go_up_for_profit_1_3_1_0.4', 'scenario7_go_up_for_profit_1_3_1_0.6', 'scenario7_go_up_for_profit_1_3_1_0.8', 'scenario7_go_up_for_profit_1_5_1_0.4', 'scenario7_go_up_for_profit_1_5_1_0.6', 'scenario7_go_up_for_profit_1_5_1_0.8']
scenariosDaan = scenarios[0:30]
scenariosTuur1 = scenarios[30:40]
scenariosTuur2 = scenarios[40:50]
scenariosTuur3 = scenarios[60:70]
scenariosTuur4 = scenarios[70:80]
scenariosTuur5 = scenarios[80:90]
scenariosTuur6 = scenarios[90:97]

e = ['scenario4_showcase_min_transitions']
f = ['scenario7_go_up_for_profit_1_3_1_0.8']

left = ['scenario1', 'scenario1_3_5_0.6_0.6', 'scenario1_3_5_0.6_0.8', 'scenario1_3_5_0.8_0.4', 'scenario1_3_5_0.8_0.6', 'scenario1_3_5_0.8_0.8', 'scenario1_5_1_0.4_0.4', 'scenario1_5_1_0.4_0.6', 'scenario1_5_1_0.4_0.8', 'scenario1_5_1_0.6_0.4', 'scenario1_5_1_0.6_0.6']
for scenario in ['scenario1']:
    i = 4
    os.system(f'ts-node ./src/main.ts -i ./data/scenarios/{scenario}.json -o {scenario} -s mdp -n {i}')
