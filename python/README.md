# chemiscope Python package

This package contains Python code to help generate input files for the
[chemiscope](https://chemiscope.org) default visualizer.

## Installation

You should use pip to install this package:

```bash
pip install chemiscope
```

This installs both a `chemiscope-input` command line tool, and the `chemiscope`
package.

## Usage

From your own code:

```python
import chemiscope

# read frames using ase
frames = ...

# add additional properties
properties = {
    "<name>": {
        target: "atom",
        values: [3, 4, 2, 8, 9, 10],
    }
}

chemiscope.write_input("my-input.json.gz", frames, extra=properties)
```
