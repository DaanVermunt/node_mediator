Hee Matthijs and Canmanie

After thinking about what we talk about this afternoon I had the following idea: the research question does not necessarily need to be changes, only the definition of 'feasible' needs to be more strict in the question:

"Is a Markov decision process a feasible model for the decision logic as defined by the MEDIATOR project?"

More specifically, as the thesis is now, it does not deal with uncertainty in the action space. It can be argued that, a model which in no way can handle uncertainty in the action space is not feasible. 

To deal with that uncertainty a relaxation on the constraint on safety needs to be made from:

"If it is inevitable to have a chance of coming in an unsafe state before the end of the time horizon, STOP!"

To:

"If it is inevitable to have a chance of coming in an unsafe state within x time steps, STOP"

Which means a chance of unsafety in the far future, does not lead to an emergency stop now.
This allows the system to have an attempt at some actions to avoid that state, before calling for an emergency stop.

Assuming this I get this to work, we can test to what level of uncertainty the system can still operate.

List of experiments which concern uncertainty in the action space: 
- A scenario where upgrading automation level is beneficial, but also poses the risk of not coming back to the lower level of automation, with 3 different levels of probability of success  of decreasing the automation level.
- Using the base case scenario (By Bram Bakker) while playing with the success probabilities of all actions.
The success probability itself is dependent on two things, on 1) the transition probability of the primitive action, and 2) the number of attempts it can do within a single option execution.
It is interesting to see how both influence the behaviour of the system.
- A scenario (still need to think of the details) where the system takes a risk, and because of the risk it takes, loses in performance from the heuristic in some cases.

Because the system becomes nondeterministic we should run all scenarios multiple times to generalize on the behavior of the agent.
This gives us options on how to compare scenarios:
- Success rate: Number of times the agent gets to the end of the scenario without calling for an emergency stop
- Mean automation level
- Mean number of wake up attempts

Next to just the numbers it might be interesting to see what 'hurdle' in the scenario was fatal for the agent most often.
Visualizing where in the simulation the agent calls for the emergency stop most will allow for such an analysis.

Do you agree that this would allow for a better and more scientific evaluation of the proposed model, and if worked out properly fill the gapes currently still in the thesis?

And, do you feel that an ablation study is still be interesting next to the analysis proposed? Personally I doubt it, because the features that are implemented are all pretty much the bare minimum to make the system work as an MDP, and removing each would result in very obvious behavior losses. 
