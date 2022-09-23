# Tool for understanding MiSTer config strings

Hosted at https://agg23.github.io/mister-config/

A very basic tool for understanding MiSTer config strings. MiSTer cores use a fairly complicated `conf_str` mapping for OSD and various settings, which is difficult to interpret for humans. The [docs are difficult to understand as well](https://mister-devel.github.io/MkDocs_MiSTer/developer/conf_str/), so I made this simple tool at the request of some other devs.

Using this, you can easily interpret the set config values, and see which value corresponds to what bits in the `status` register.