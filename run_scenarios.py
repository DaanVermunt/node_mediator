import subprocess

scenarios = ['scenario1', 'scenario1_1_1_0.4_0.4', 'scenario1_1_1_0.4_0.6', 'scenario1_1_1_0.4_0.8', 'scenario1_1_1_0.6_0.4', 'scenario1_1_1_0.6_0.6', 'scenario1_1_1_0.6_0.8', 'scenario1_1_1_0.8_0.4', 'scenario1_1_1_0.8_0.6', 'scenario1_1_1_0.8_0.8', 'scenario1_1_3_0.4_0.4', 'scenario1_1_3_0.4_0.6', 'scenario1_1_3_0.4_0.8', 'scenario1_1_3_0.6_0.4', 'scenario1_1_3_0.6_0.6', 'scenario1_1_3_0.6_0.8', 'scenario1_1_3_0.8_0.4', 'scenario1_1_3_0.8_0.6', 'scenario1_1_3_0.8_0.8', 'scenario1_1_5_0.4_0.4', 'scenario1_1_5_0.4_0.6', 'scenario1_1_5_0.4_0.8', 'scenario1_1_5_0.6_0.4', 'scenario1_1_5_0.6_0.6', 'scenario1_1_5_0.6_0.8', 'scenario1_1_5_0.8_0.4', 'scenario1_1_5_0.8_0.6', 'scenario1_1_5_0.8_0.8', 'scenario1_3_1_0.4_0.4', 'scenario1_3_1_0.4_0.6', 'scenario1_3_1_0.4_0.8', 'scenario1_3_1_0.6_0.4', 'scenario1_3_1_0.6_0.6', 'scenario1_3_1_0.6_0.8', 'scenario1_3_1_0.8_0.4', 'scenario1_3_1_0.8_0.6', 'scenario1_3_1_0.8_0.8', 'scenario1_3_3_0.4_0.4', 'scenario1_3_3_0.4_0.6', 'scenario1_3_3_0.4_0.8', 'scenario1_3_3_0.6_0.4', 'scenario1_3_3_0.6_0.6', 'scenario1_3_3_0.6_0.8', 'scenario1_3_3_0.8_0.4', 'scenario1_3_3_0.8_0.6', 'scenario1_3_3_0.8_0.8', 'scenario1_3_5_0.4_0.4', 'scenario1_3_5_0.4_0.6', 'scenario1_3_5_0.4_0.8', 'scenario1_3_5_0.6_0.4', 'scenario1_3_5_0.6_0.6', 'scenario1_3_5_0.6_0.8', 'scenario1_3_5_0.8_0.4', 'scenario1_3_5_0.8_0.6', 'scenario1_3_5_0.8_0.8', 'scenario1_5_1_0.4_0.4', 'scenario1_5_1_0.4_0.6', 'scenario1_5_1_0.4_0.8', 'scenario1_5_1_0.6_0.4', 'scenario1_5_1_0.6_0.6', 'scenario1_5_1_0.6_0.8', 'scenario1_5_1_0.8_0.4', 'scenario1_5_1_0.8_0.6', 'scenario1_5_1_0.8_0.8', 'scenario1_5_3_0.4_0.4', 'scenario1_5_3_0.4_0.6', 'scenario1_5_3_0.4_0.8', 'scenario1_5_3_0.6_0.4', 'scenario1_5_3_0.6_0.6', 'scenario1_5_3_0.6_0.8', 'scenario1_5_3_0.8_0.4', 'scenario1_5_3_0.8_0.6', 'scenario1_5_3_0.8_0.8', 'scenario1_5_5_0.4_0.4', 'scenario1_5_5_0.4_0.6', 'scenario1_5_5_0.4_0.8', 'scenario1_5_5_0.6_0.4', 'scenario1_5_5_0.6_0.6', 'scenario1_5_5_0.6_0.8', 'scenario1_5_5_0.8_0.4', 'scenario1_5_5_0.8_0.6', 'scenario1_5_5_0.8_0.8', 'scenario2_showcase_max_automation', 'scenario3_showcase_min_automation', 'scenario4_showcase_min_transitions', 'scenario5_showcase_impact', 'scenario6_showcase_lack_of_cum_impact', 'scenario7_go_up_for_profit', 'scenario7_go_up_for_profit_1_1_1_0.4', 'scenario7_go_up_for_profit_1_1_1_0.6', 'scenario7_go_up_for_profit_1_1_1_0.8', 'scenario7_go_up_for_profit_1_3_1_0.4', 'scenario7_go_up_for_profit_1_3_1_0.6', 'scenario7_go_up_for_profit_1_3_1_0.8', 'scenario7_go_up_for_profit_1_5_1_0.4', 'scenario7_go_up_for_profit_1_5_1_0.6', 'scenario7_go_up_for_profit_1_5_1_0.8']
scenariosDaan = scenarios[0:30]
scenariosTuur1 = scenarios[30:50]
scenariosTuur2 = scenarios[30:70]
scenariosKees = scenarios[75:97]

for scenario in scenariosKees:
    for i in [0, 1]:
        print(f'ts-node ./src/main.ts -i {scenario}.json -o {scenario} -s mdp -n {i + 1}')
        break
        a = subprocess.Popen([f'ts-node ./src/main.ts -i ./data/scenarios/{scenario}.json -o {scenario} -s mdp -n {i + 1}'])
        b = subprocess.Popen([f'ts-node ./src/main.ts -i ./data/scenarios/{scenario}.json -o {scenario} -s mdp -n {i + 2}'])
        c = subprocess.Popen([f'ts-node ./src/main.ts -i ./data/scenarios/{scenario}.json -o {scenario} -s mdp -n {i + 3}'])
        d = subprocess.Popen([f'ts-node ./src/main.ts -i ./data/scenarios/{scenario}.json -o {scenario} -s mdp -n {i + 4}'])
        e = subprocess.Popen([f'ts-node ./src/main.ts -i ./data/scenarios/{scenario}.json -o {scenario} -s mdp -n {i + 5}'])

        a.wait()
        b.wait()
        c.wait()
        d.wait()
        e.wait()
    break
