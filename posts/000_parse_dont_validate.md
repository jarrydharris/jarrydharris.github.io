## Key Takeaways: "Parse, don't validate".
###### 09-11-2024
---

#### Resource:

Article: [*Parse, Don't validate*](https://lexi-lambda.github.io/blog/2019/11/05/parse-don-t-validate/)   
Author: *Alexis King*                                                                                  

#### Key Takeaways:

1. Data validation code in one part of a system often needs to be duplicated in downstream components.
2. Packaging valid data with the guarantee of its validity removes the need for duplicating validation code.
3. The author uses "Type Driven Design" to communicate validity to the rest of the system. They suggest the following:
   - Avoid the use of `None`.
   - Define types that communicate a valid or invalid state.
   - Leverage functional programming techniques to avoid creating a new set of problems.

#### Notes:

##### Communicating with types

- Compilers, type checkers and modern IDEs provide instant feedback.
- The `None` type can encourage undesirable code.

In the following painfully contrived example, we only find out at runtime if we performed an operation that made sense:

```python
class Ball:
  sport: Literal["soccer", "golf"]
  pressure: None | float

def check_pressure(ball: Ball) -> None | float: ...
```

Now we need to handle the case when something like this happens:

```Python
check_pressure(Ball("golf")) # It doesn't make much sense to check the pressure of a golf ball
```

In practice, this can create a lot of duplicate code. Any downstream function that relies on the `check_pressure` validation step will now also need to include validation code to handle any `None` cases. If downstream functions don't handle `None`, purely out of "trust" that a previous step already performed that check, we risk future changes to the system causing unexpected bugs.

Additionally, this approach provides no feedback when we are writing the code. If we make a simple mistake like passing the wrong variable into a function, we don't find out about it until the bug happens.

Let's try with more granular types:

```python
class GolfBall: ...
class FootBall:
  pressure: float

golf_ball = GolfBall()
foot_ball = FootBall()

# Note the function only takes the valid type `FootBall`
def check_pressure(ball: FootBall) -> float: ... 
```

And compare how this looks with and without a modern IDE.

<table width="100%">
<tr>
<td></td>
<td>Valid type</td>
<td>Invalid type</td>
</tr>
<tr>
<td>Without IDE type checking</td>
<td>

```python
check_pressure(foot_ball) 
```

</td>
<td>

```python
check_pressure(golf_ball) 
```

</td>
</tr>
<tr>
<td>With IDE type checking</td>

<td>

```python
check_pressure(foot_ball) 
```

</td>
<td>
<span class="error">

```python
check_pressure(golf_ball) 
```

</span>
</td>
</tr>
</table>

This kind of visual feedback is an excellent way to catch bugs before they happen.

By using types to drive the behavior of our code we achieve the following:
- Remove need for duplicate validation checks
- Get instant feedback on programming errors
- Self document the code and make it more robust to future changes 


##### Ok, we got rid of `None`, but how do we handle runtime errors?

If we try to naively remove `None` from the codebase we would just end up with errors.

The trick is to wrap our data in a container that represents the "result" of an operation. To do this we use a concept from functional programming called the "monad". I'm not going to go deep into this, but I've provided a few resources for learning [here](#endofunctors-monoids-huh). In a nutshell, monads are like boxes that hold our data, rather than operating directly on our data, we provide the transformation to the box, which in the event of an illegal operation, it will hold on to the error.

Let's take a look an example class that defines a result monad (result container) for an application that parses information about footballs:

```python
class ParseFootBallResult(Generic[T]):
    value: T
    error: Optional[Exception] = None

    def __init__(self, input_data: T | Exception) -> None:
        if isinstance(input_data, Exception):
            self.error = input_data
        else:
            self.value = input_data

    def map(self, function: Callable[[T], U | Exception]) -> "ParseFootBallResult[U]":
        if self.error:
            return ParseFootBallResult[U](self.error)
        return ParseFootBallResult[U](function(self.value))

```

The class can be boiled down to two concepts. 

    1. The "result" which is either the value of a computation, or an error state.
    2. The ability to control when a function can be applied to the value.

To see how it works we can imagine our user wants to get information about the footballs available to see which one meets their competition standards. They query the available balls and get a response like this:

```
records: list[Record] = [
    {
        "id": "ball_000",
        "circumference_mm": 697.0,
        "weight_grams": 420.0,
        "pressure_psi": 12.0,
    },
    {
        "id": "ball_001",
        "circumference_mm": 698.5,
        "weight_grams": 420.0,
        "pressure_psi": 13.0,
    },
    ...
]
```

The first thing we would need to do is attempt to convert each record into a `FootBall`, with the attempt wrapped in a `ParseFootBallResult` monad.

```python
@dataclass
class FootBall:
    id: str
    circumference_mm: float
    weight_grams: float
    pressure_psi: float

    def __post_init__(self) -> None:
        self._validate_fields() # Raises an exception if we don't have valid input

def parse_record(record: Record, cls: Type[T]) -> ParseFootBallResult[T]:
    try:
        return ParseFootBallResult[T](cls(**record)) 
    except Exception as e:
        return ParseFootBallResult[T](e)



parsed_footballs = [
    parse_record(record, FootBall) for record in records
]
```

The `parse_record` function is the first time we get to see these ideas in action. When we parse `records` we get the following:

```python
# stdout:
Valid:

        ParseFootBallResult(FootBall(id='ball_000', circumference_mm=697.0, weight_grams=420.0, pressure_psi=12.0))
        ParseFootBallResult(FootBall(id='ball_001', circumference_mm=698.5, weight_grams=420.0, pressure_psi=13.0))
        ParseFootBallResult(FootBall(id='ball_002', circumference_mm=711.2, weight_grams=430.0, pressure_psi=12.5))
        ParseFootBallResult(FootBall(id='ball_003', circumference_mm=673.1, weight_grams=390.0, pressure_psi=10.0))

Invalid:

        ParseFootBallResult(InvalidFootballError("FootBall fields contain invalid data: 'pressure_psi: None'"))
        ParseFootBallResult(TypeError("FootBall.__init__() missing 1 required positional argument: 'circumference_mm'"))
```

This is handy, because we have all the valid data and our descriptive errors in the same place. The real magic of course is we can continue to apply functions to the values without fear of performing illegal operations that might interrupt the system.

For example, let's map a validation check to ensure the footballs are within competition standard:

```python
game_ready_footballs = [
    football.map(validate_game_ready) for football in parsed_footballs
]
```
The resulting output shows the remaining valid `FootBall` and also preserves the original `Exceptions`, meaning we can always trace them back to their cause. 

```python
# stdout:

Valid:

        ParseFootBallResult(GameReadyFootBall(id='ball_001', circumference_mm=698.5, weight_grams=420.0, pressure_psi=13.0))

Invalid:

        ParseFootBallResult(InvalidFootballError("Football is not ready for a game: {'circumference_mm': False, 'weight_grams': True, 'pressure_psi': False}"))
        ParseFootBallResult(InvalidFootballError("Football is not ready for a game: {'circumference_mm': False, 'weight_grams': False, 'pressure_psi': False}"))
        ParseFootBallResult(InvalidFootballError("Football is not ready for a game: {'circumference_mm': False, 'weight_grams': False, 'pressure_psi': False}"))
        ParseFootBallResult(InvalidFootballError("FootBall fields contain invalid data: 'pressure_psi: None'"))
        ParseFootBallResult(TypeError("FootBall.__init__() missing 1 required positional argument: 'circumference_mm'"))
```


##### Endofunctors? Monoids? Huh?

I went down a bit of a functional programming rabbit hole after reading the original article, here are some of the easier to follow resources:

🐇 [Python Functors and Monads: A Practical Guide](https://arjancodes.com/blog/python-functors-and-monads/)  
🕳️ [Functors and Monads For People Who Have Read Too Many "Tutorials"](https://www.jerf.org/iri/post/2958/)

##### Should I throw out validation code and only ever write type driven parsers?

Probably not, the author points out there is a trade-off. Validation code is simpler, quicker and easier. Rigorous type driven design is probably only going to be worth it when you are really optimizing for a robust system.