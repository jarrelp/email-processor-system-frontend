import { useEffect, useState } from 'react';

// material-ui
import { useTheme } from '@mui/material/styles';
import {
    CardContent,
    Fab,
    Grid,
    InputAdornment,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TablePagination,
    TableRow,
    TextField,
    Tooltip,
    Typography
} from '@mui/material';

// project imports
import MainCard from 'ui-component/cards/MainCard';
import SubCard from 'ui-component/cards/SubCard';
import SkillTableHead from './SkillTableHead';
import RowSkeleton from 'ui-component/cards/skeleton/RowSkeleton';
import SkillItem from './SkillItem';
import AddSkill from './AddSkill';
import { useDispatch, useSelector } from 'store';
import { getSkillsList, selectSkills } from 'store/slices/skills';
import { openDrawer } from 'store/slices/menu';
import EmptyBoxImage from 'assets/Images/empty-box.png';
import { selectLoading } from 'store/slices/loading';

// constants
import { gridSpacing } from 'store/constant';

// assets
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/AddTwoTone';

// table sort
function descendingComparator(a, b, orderBy) {
    if (b[orderBy] < a[orderBy]) {
        return -1;
    }
    if (b[orderBy] > a[orderBy]) {
        return 1;
    }
    return 0;
}

const getComparator = (order, orderBy) =>
    order === 'desc' ? (a, b) => descendingComparator(a, b, orderBy) : (a, b) => -descendingComparator(a, b, orderBy);

function stableSort(array, comparator) {
    const stabilizedThis = array.map((el, index) => [el, index]);
    stabilizedThis.sort((a, b) => {
        const order = comparator(a[0], b[0]);
        if (order !== 0) return order;
        return a[1] - b[1];
    });
    return stabilizedThis.map((el) => el[0]);
}

// table header options
const headCells = [
    {
        id: 'id',
        numeric: true,
        label: 'ID',
        align: 'left',
        initialValue: 0
    },
    {
        id: 'name',
        numeric: false,
        label: 'Name',
        align: 'left',
        initialValue: ''
    }
];

// ==============================|| SKILL LIST ||============================== //

const SkillList = () => {
    const dispatch = useDispatch();

    // show a right sidebar when clicked on new custom
    const [openAdd, setOpenAdd] = useState(false);
    const handleClickOpenAddDialog = () => {
        setOpenAdd(true);
    };
    const handleCloseAddDialog = () => {
        setOpenAdd(false);
    };

    // skill data
    const skillState = useSelector(selectSkills);

    useEffect(() => {
        if (skillState == 0) {
            dispatch(getSkillsList());
        }
        dispatch(openDrawer(false));
    }, [dispatch]);

    const isLoading = useSelector(selectLoading);

    const theme = useTheme();

    const [order, setOrder] = useState('asc');
    const [orderBy, setOrderBy] = useState('calories');
    const [selected, setSelected] = useState([]);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(5);
    const [search, setSearch] = useState('');
    const [rows, setRows] = useState([]);

    useEffect(() => {
        setRows(skillState);
    }, [skillState]);

    const handleSearch = (event) => {
        const newString = event?.target.value;
        setSearch(newString || '');

        if (newString) {
            const newRows = rows.filter((row) => {
                let matches = true;

                let properties = headCells.map((h) => h.id);

                let containsQuery = false;

                properties.forEach((property) => {
                    if (row[property].toString().toLowerCase().includes(newString.toString().toLowerCase())) {
                        containsQuery = true;
                    }
                });

                if (!containsQuery) {
                    matches = false;
                }
                return matches;
            });
            setRows(newRows);
        } else {
            setRows(skillState);
        }
    };

    const handleRequestSort = (event, property) => {
        const isAsc = orderBy === property && order === 'asc';
        setOrder(isAsc ? 'desc' : 'asc');
        setOrderBy(property);
    };

    const handleSelectAllClick = (event) => {
        if (event.target.checked) {
            const newSelectedId = rows.map((n) => n.id);
            setSelected(newSelectedId);
            return;
        }
        setSelected([]);
    };

    const handleClick = (event, id) => {
        const selectedIndex = selected.indexOf(id);
        let newSelected = [];

        if (selectedIndex === -1) {
            newSelected = newSelected.concat(selected, id);
        } else if (selectedIndex === 0) {
            newSelected = newSelected.concat(selected.slice(1));
        } else if (selectedIndex === selected.length - 1) {
            newSelected = newSelected.concat(selected.slice(0, -1));
        } else if (selectedIndex > 0) {
            newSelected = newSelected.concat(selected.slice(0, selectedIndex), selected.slice(selectedIndex + 1));
        }

        setSelected(newSelected);
    };

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event?.target.value, 10));
        setPage(0);
    };

    const isSelected = (id) => selected.indexOf(id) !== -1;
    const emptyRows = page > 0 ? Math.max(0, (1 + page) * rowsPerPage - rows.length) : 0;

    return (
        <>
            <MainCard title="Skill List" content={true}>
                <CardContent>
                    <Grid container justifyContent="space-between" alignItems="center" spacing={2}>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <SearchIcon fontSize="small" />
                                        </InputAdornment>
                                    )
                                }}
                                onChange={handleSearch}
                                placeholder="Search Skill"
                                value={search}
                                size="small"
                            />
                        </Grid>
                        <Grid item xs={12} sm={6} sx={{ textAlign: 'right' }}>
                            {/* custom add & dialog */}
                            <Tooltip title="Add Skill">
                                <Fab
                                    color="primary"
                                    size="small"
                                    onClick={handleClickOpenAddDialog}
                                    sx={{ boxShadow: 'none', ml: 1, width: 32, height: 32, minHeight: 32 }}
                                >
                                    <AddIcon fontSize="small" />
                                </Fab>
                            </Tooltip>
                            <AddSkill open={openAdd} handleCloseDialog={handleCloseAddDialog} />
                        </Grid>
                    </Grid>
                </CardContent>
                {!isLoading && skillState.length === 0 ? (
                    <Grid container spacing={gridSpacing}>
                        <Grid item xs={12} md={4}>
                            <SubCard variant="body1" sx={{ height: '100%' }}>
                                <Typography variant="subtitle1" sx={{ textAlign: 'center' }}>
                                    No skills found
                                </Typography>
                            </SubCard>
                        </Grid>
                        <Grid item xs={12} md={8}>
                            <SubCard>
                                <img src={EmptyBoxImage} alt="empty box" width="50%" height="50%" position="absolute" />
                            </SubCard>
                        </Grid>
                    </Grid>
                ) : (
                    <>
                        {/* table */}
                        <TableContainer>
                            <Table sx={{ minWidth: 750 }} aria-labelledby="tableTitle">
                                <SkillTableHead
                                    numSelected={selected.length}
                                    order={order}
                                    orderBy={orderBy}
                                    onSelectAllClick={handleSelectAllClick}
                                    onRequestSort={handleRequestSort}
                                    rowCount={rows.length}
                                    theme={theme}
                                    selected={selected}
                                    headCells={headCells}
                                />
                                <TableBody>
                                    {isLoading ? (
                                        <RowSkeleton rowsPerPage={rowsPerPage} attributeAmmount={headCells} />
                                    ) : (
                                        stableSort(rows, getComparator(order, orderBy))
                                            .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                                            .map((row, index) => {
                                                if (typeof row === 'number') return null;
                                                const isItemSelected = isSelected(row.id);
                                                const labelId = `enhanced-table-checkbox-${index}`;

                                                return (
                                                    <SkillItem
                                                        key={index}
                                                        skill={row}
                                                        isItemSelected={isItemSelected}
                                                        labelId={labelId}
                                                        handleClick={handleClick}
                                                    />
                                                );
                                            })
                                    )}

                                    {emptyRows > 0 && (
                                        <TableRow
                                            style={{
                                                height: 53 * emptyRows
                                            }}
                                        >
                                            <TableCell colSpan={6} />
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </TableContainer>

                        {/* table pagination */}
                        <TablePagination
                            rowsPerPageOptions={[5, 10, 25]}
                            component="div"
                            count={rows.length}
                            rowsPerPage={rowsPerPage}
                            page={page}
                            onPageChange={handleChangePage}
                            onRowsPerPageChange={handleChangeRowsPerPage}
                        />
                    </>
                )}
            </MainCard>
        </>
    );
};

export default SkillList;
